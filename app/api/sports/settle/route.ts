import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

/**
 * 体育投注结算
 * 遍历 bet_slips 中 won=0 的未结算记录，通过 matches 表获取真实赛果：
 *   - 新路径（match_ref_id 不为空）：直接 JOIN matches 表
 *   - 旧路径（match_ref_id 为空）：通过 CAST(match_id AS INTEGER) 关联 matches.id 兼容旧数据
 * - 命中：won=1，加积分（cost * total_odds）
 * - 未命中：won=-1
 */
export async function POST() {
  const db = getDB()

  // 获取所有未结算投注，JOIN matches 获取比分
  const slips = db.prepare(`
    SELECT 
      bs.id, bs.match_id, bs.pick, bs.odds, bs.total_odds, bs.cost, bs.user_id, bs.match_ref_id,
      m.home_score, m.away_score
    FROM bet_slips bs
    LEFT JOIN matches m ON (
      (bs.match_ref_id IS NOT NULL AND bs.match_ref_id = m.id)
      OR
      (bs.match_ref_id IS NULL AND CAST(bs.match_id AS INTEGER) = m.id)
    )
    WHERE bs.won = 0
  `).all() as { id: number; match_id: string; pick: string; odds: number; total_odds: number; cost: number; user_id: number; match_ref_id: number | null; home_score: number | null; away_score: number | null }[]

  if (slips.length === 0) {
    return NextResponse.json({ code: 0, data: { settled: 0, message: '没有待结算的投注' } })
  }

  const settled: { slipId: number; matchId: string; pick: string; result: 'hit' | 'miss'; pointsAwarded: number }[] = []

  for (const slip of slips) {
    // 无比分数据则跳过该投注
    if (slip.home_score == null || slip.away_score == null) continue

    let actualPick: string
    if (slip.home_score > slip.away_score) {
      actualPick = 'home'
    } else if (slip.home_score < slip.away_score) {
      actualPick = 'away'
    } else {
      actualPick = 'draw'
    }

    if (slip.pick === actualPick) {
      const pointsAwarded = Math.round(slip.cost * slip.total_odds)
      db.prepare('UPDATE bet_slips SET won = 1 WHERE id = ?').run(slip.id)
      db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(pointsAwarded, slip.user_id || 1)
      db.prepare(
        "INSERT INTO points_history (user_id, amount, reason, type, detail) VALUES (?, ?, '投注中奖', 'earn', '竞彩足球投注中奖')"
      ).run(slip.user_id || 1, pointsAwarded)
      settled.push({ slipId: slip.id, matchId: slip.match_id, pick: slip.pick, result: 'hit', pointsAwarded })
    } else {
      db.prepare('UPDATE bet_slips SET won = -1 WHERE id = ?').run(slip.id)
      settled.push({ slipId: slip.id, matchId: slip.match_id, pick: slip.pick, result: 'miss', pointsAwarded: 0 })
    }
  }

  return NextResponse.json({
    code: 0,
    data: {
      settled: settled.length,
      details: settled,
    },
  })
}
