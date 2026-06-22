import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'

/**
 * 分享预测 +20 积分
 * 需认证，每日最多 1 次
 */
async function handler(req: AuthenticatedRequest) {
  const db = getDB()
  const userId = req.user.id
  const today = new Date().toISOString().slice(0, 10)

  // 检查用户是否存在
  const user = db.prepare('SELECT id, points FROM users WHERE id = ?').get(userId) as { id: number; points: number } | undefined
  if (!user) {
    return NextResponse.json({ code: -1, message: '用户不存在' }, { status: 404 })
  }

  // 检查今日是否已领取
  const alreadyShared = db.prepare(
    "SELECT id FROM points_history WHERE user_id = ? AND reason = '分享预测结果' AND created_at LIKE ? LIMIT 1"
  ).get(userId, `${today}%`)

  if (alreadyShared) {
    return NextResponse.json({ code: -1, message: '今日已领取分享奖励，请明天再来' }, { status: 400 })
  }

  // TOCTOU 防护：事务内写入
  db.prepare('BEGIN IMMEDIATE').run()
  try {
    // 二次检查
    const doubleCheck = db.prepare(
      "SELECT id FROM points_history WHERE user_id = ? AND reason = '分享预测结果' AND created_at LIKE ? LIMIT 1"
    ).get(userId, `${today}%`)
    if (doubleCheck) {
      db.prepare('ROLLBACK').run()
      return NextResponse.json({ code: -1, message: '今日已领取分享奖励，请明天再来' }, { status: 400 })
    }

    db.prepare('UPDATE users SET points = points + 20 WHERE id = ?').run(userId)
    db.prepare(
      "INSERT INTO points_history (user_id, amount, reason, type, detail) VALUES (?, 20, '分享预测结果', 'earn', '分享预测获得 20 积分')"
    ).run(userId)

    db.prepare('COMMIT').run()

    const updated = db.prepare('SELECT points FROM users WHERE id = ?').get(userId) as { points: number }
    return NextResponse.json({
      code: 0,
      data: { points: 20, totalPoints: updated.points },
    })
  } catch (e) {
    db.prepare('ROLLBACK').run()
    throw e
  }
}

export const POST = withAuth(handler)
