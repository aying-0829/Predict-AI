import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'

// GET: 获取对战详情
async function handleGet(req: AuthenticatedRequest, context: unknown) {
  const db = getDB()
  const duelId = parseInt((context as { params: { id: string } }).params.id)

  const duel = db.prepare(`
    SELECT d.*,
           c.username as challenger_name,
           o.username as opponent_name
    FROM duels d
    JOIN users c ON d.challenger_id = c.id
    JOIN users o ON d.opponent_id = o.id
    WHERE d.id = ?
  `).get(duelId) as Record<string, unknown> | undefined

  if (!duel) {
    return NextResponse.json({ code: -1, message: '对战不存在' }, { status: 404 })
  }

  return NextResponse.json({
    code: 0,
    data: {
      id: duel.id,
      challengerId: duel.challenger_id,
      challengerName: duel.challenger_name,
      opponentId: duel.opponent_id,
      opponentName: duel.opponent_name,
      matchId: duel.match_id,
      matchInfo: duel.match_info,
      stake: duel.stake,
      challengerPick: duel.challenger_pick,
      opponentPick: duel.opponent_pick,
      result: duel.result,
      winnerId: duel.winner_id,
      createdAt: duel.created_at,
      settledAt: duel.settled_at,
    },
  })
}

// PATCH: 接受对战/提交预测/结算
async function handlePatch(req: AuthenticatedRequest, context: unknown) {
  const db = getDB()
  const userId = req.user.id
  const duelId = parseInt((context as { params: { id: string } }).params.id)
  const body = await req.json()
  const { action, pick } = body

  const duel = db.prepare('SELECT * FROM duels WHERE id = ?').get(duelId) as Record<string, unknown> | undefined
  if (!duel) {
    return NextResponse.json({ code: -1, message: '对战不存在' }, { status: 404 })
  }

  if (action === 'accept') {
    if (duel.opponent_id !== userId) {
      return NextResponse.json({ code: -1, message: '只有被挑战者可以接受' }, { status: 403 })
    }
    if (duel.result !== 'pending') {
      return NextResponse.json({ code: -1, message: '对战已结束' }, { status: 400 })
    }
    // 检查对手积分
    const opp = db.prepare('SELECT points FROM users WHERE id = ?').get(userId) as { points: number }
    if (opp.points < (duel.stake as number)) {
      return NextResponse.json({ code: -1, message: '积分不足' }, { status: 400 })
    }

    db.prepare(
      'UPDATE duels SET opponent_pick = ? WHERE id = ?'
    ).run(pick || '', duelId)

    return NextResponse.json({ code: 0, message: '已接受对战' })
  }

  if (action === 'settle') {
    if (duel.result !== 'pending') {
      return NextResponse.json({ code: -1, message: '对战已结算' }, { status: 400 })
    }
    const winnerId = body.winnerId || 0
    const stake = duel.stake as number
    const challengerId = duel.challenger_id as number
    const opponentId = duel.opponent_id as number
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19)

    if (winnerId) {
      const winner = winnerId === challengerId ? challengerId : opponentId
      const loser = winnerId === challengerId ? opponentId : challengerId

      // 输家扣分
      db.prepare('UPDATE users SET points = MAX(0, points - ?) WHERE id = ?').run(stake, loser)
      // 赢家加分
      db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(stake, winner)

      // 积分流水
      db.prepare(
        "INSERT INTO points_history (user_id, amount, reason, type, detail) VALUES (?, ?, '对战获胜', 'earn', ?)"
      ).run(winner, stake, `对战获胜获得 ${stake} 积分`)
      db.prepare(
        "INSERT INTO points_history (user_id, amount, reason, type, detail) VALUES (?, ?, '对战失败', 'spend', ?)"
      ).run(loser, -stake, `对战失败扣除 ${stake} 积分`)

      db.prepare(
        'UPDATE duels SET result = ?, winner_id = ?, settled_at = ? WHERE id = ?'
      ).run(winnerId === challengerId ? 'challenger_win' : 'opponent_win', winnerId, now, duelId)
    } else {
      // 平局
      db.prepare(
        'UPDATE duels SET result = ?, settled_at = ? WHERE id = ?'
      ).run('draw', now, duelId)
    }

    return NextResponse.json({ code: 0, message: '对战已结算' })
  }

  return NextResponse.json({ code: -1, message: '未知操作' }, { status: 400 })
}

export const GET = withAuth(handleGet)
export const PATCH = withAuth(handlePatch)
