import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'

/**
 * 完成 AI 预测 +5 积分
 * 需认证，每日最多 5 次
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

  // 检查今日已领取次数
  const row = db.prepare(
    "SELECT COUNT(*) as cnt FROM points_history WHERE user_id = ? AND reason = '完成 AI 预测' AND created_at LIKE ?"
  ).get(userId, `${today}%`) as { cnt: number }

  if (row.cnt >= 5) {
    return NextResponse.json({ code: -1, message: '今日已完成 5 次 AI 预测奖励，请明天再来' }, { status: 400 })
  }

  // TOCTOU 防护：事务内写入
  db.prepare('BEGIN IMMEDIATE').run()
  try {
    // 二次检查
    const doubleCheck = db.prepare(
      "SELECT COUNT(*) as cnt FROM points_history WHERE user_id = ? AND reason = '完成 AI 预测' AND created_at LIKE ?"
    ).get(userId, `${today}%`) as { cnt: number }
    if (doubleCheck.cnt >= 5) {
      db.prepare('ROLLBACK').run()
      return NextResponse.json({ code: -1, message: '今日已完成 5 次 AI 预测奖励，请明天再来' }, { status: 400 })
    }

    db.prepare('UPDATE users SET points = points + 5 WHERE id = ?').run(userId)
    db.prepare(
      "INSERT INTO points_history (user_id, amount, reason, type, detail) VALUES (?, 5, '完成 AI 预测', 'earn', '完成 AI 预测获得 5 积分')"
    ).run(userId)

    db.prepare('COMMIT').run()

    const updated = db.prepare('SELECT points FROM users WHERE id = ?').get(userId) as { points: number }
    return NextResponse.json({
      code: 0,
      data: { points: 5, totalPoints: updated.points, remaining: 4 - doubleCheck.cnt },
    })
  } catch (e) {
    db.prepare('ROLLBACK').run()
    throw e
  }
}

export const POST = withAuth(handler)
