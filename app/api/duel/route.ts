import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'

// GET: 获取用户的对战列表
async function handleGet(req: AuthenticatedRequest) {
  const db = getDB()
  const userId = req.user.id
  const url = new URL(req.url)
  const status = url.searchParams.get('status') || 'all'

  let whereClause = '(challenger_id = ? OR opponent_id = ?)'
  const params: unknown[] = [userId, userId]

  if (status === 'active') {
    whereClause += " AND result = 'pending'"
  } else if (status === 'settled') {
    whereClause += " AND result != 'pending'"
  }

  const duels = db.prepare(`
    SELECT d.*,
           c.username as challenger_name,
           o.username as opponent_name
    FROM duels d
    JOIN users c ON d.challenger_id = c.id
    JOIN users o ON d.opponent_id = o.id
    WHERE ${whereClause}
    ORDER BY d.created_at DESC
    LIMIT 50
  `).all(...params) as Array<Record<string, unknown>>

  return NextResponse.json({
    code: 0,
    data: duels.map((d) => ({
      id: d.id,
      challengerId: d.challenger_id,
      challengerName: d.challenger_name,
      opponentId: d.opponent_id,
      opponentName: d.opponent_name,
      matchId: d.match_id,
      matchInfo: d.match_info,
      stake: d.stake,
      challengerPick: d.challenger_pick,
      opponentPick: d.opponent_pick,
      result: d.result,
      winnerId: d.winner_id,
      createdAt: d.created_at,
      settledAt: d.settled_at,
    })),
  })
}

// POST: 创建对战
async function handlePost(req: AuthenticatedRequest) {
  const db = getDB()
  const challengerId = req.user.id
  const body = await req.json()
  const { opponentId, matchId, matchInfo, stake, pick } = body

  if (!opponentId || !matchId) {
    return NextResponse.json({ code: -1, message: '缺少对手或比赛信息' }, { status: 400 })
  }

  if (opponentId === challengerId) {
    return NextResponse.json({ code: -1, message: '不能与自己对战' }, { status: 400 })
  }

  // 检查对手是否存在
  const opponent = db.prepare('SELECT id FROM users WHERE id = ?').get(opponentId)
  if (!opponent) {
    return NextResponse.json({ code: -1, message: '对手不存在' }, { status: 404 })
  }

  const cost = Math.max(1, parseInt(stake) || 10)

  // 检查挑战者积分
  const user = db.prepare('SELECT points FROM users WHERE id = ?').get(challengerId) as { points: number }
  if (user.points < cost) {
    return NextResponse.json({ code: -1, message: '积分不足' }, { status: 400 })
  }

  const result = db.prepare(`
    INSERT INTO duels (challenger_id, opponent_id, match_id, match_info, stake, challenger_pick)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(challengerId, opponentId, matchId, matchInfo || '', cost, pick || '')

  return NextResponse.json({
    code: 0,
    data: { id: result.lastInsertRowid, stake: cost },
    message: '对战邀请已发送',
  })
}

export const GET = withAuth(handleGet)
export const POST = withAuth(handlePost)
