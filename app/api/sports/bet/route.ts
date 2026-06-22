import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'

export const dynamic = 'force-dynamic'

async function handler(request: AuthenticatedRequest) {
  const { selections } = await request.json()
  const db = getDB()
  const userId = request.user.id

  db.prepare('BEGIN IMMEDIATE').run()

  try {
    // 检查积分余额
    const userBalance = db.prepare('SELECT points FROM users WHERE id = ?').get(userId) as { points: number } | undefined
    if (!userBalance) {
      db.prepare('ROLLBACK').run()
      return NextResponse.json({ code: -1, message: '用户不存在' }, { status: 404 })
    }
    if (userBalance.points < 100) {
      db.prepare('ROLLBACK').run()
      return NextResponse.json({ code: -1, message: '积分不足，投注需要 100 积分' }, { status: 400 })
    }

    const totalOdds = Math.round(selections.reduce((acc: number, s: { odds: number }) => acc * s.odds, 1) * 100) / 100

    // 扣积分
    db.prepare('UPDATE users SET points = points - 100 WHERE id = ?').run(userId)

    // 写入 bet_slips
    const insert = db.prepare(
      'INSERT INTO bet_slips (match_id, pick, odds, total_odds, cost, won, created_at, user_id) VALUES (?, ?, ?, ?, 100, 0, datetime(\'now\',\'localtime\'), ?)'
    )
    for (const s of selections) {
      insert.run(s.matchId, s.pick, s.odds, totalOdds, userId)
    }

    // 积分流水（带 user_id）
    db.prepare(
      "INSERT INTO points_history (user_id, amount, reason, type, detail) VALUES (?, -100, '模拟投注', 'spend', '竞彩足球模拟投注')"
    ).run(userId)

    db.prepare('COMMIT').run()

    // 读取剩余积分
    const user = db.prepare('SELECT points FROM users WHERE id = ?').get(userId) as { points: number } | undefined

    return NextResponse.json({
      code: 0,
      data: {
        totalOdds,
        cost: 100,
        remainingPoints: user?.points ?? 0,
      },
    })
  } catch (e) {
    db.prepare('ROLLBACK').run()
    throw e
  }
}

export const POST = withAuth(handler)
