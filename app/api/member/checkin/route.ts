import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'

async function handler(req: AuthenticatedRequest) {
  const db = getDB()
  const userId = req.user.id

  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  // TOCTOU 竞态防护：开启 BEGIN IMMEDIATE 事务串行化写入
  const txn = db.prepare('BEGIN IMMEDIATE')
  txn.run()

  try {
    // 在事务内查询：今日是否已签到
    const alreadyCheckedIn = db.prepare(
      "SELECT id FROM points_history WHERE user_id = ? AND reason = '每日签到' AND created_at LIKE ? LIMIT 1"
    ).get(userId, `${today}%`)

    if (alreadyCheckedIn) {
      db.prepare('ROLLBACK').run()
      return NextResponse.json({ code: -1, message: '今日已签到，请明天再来' }, { status: 400 })
    }

    const user = db.prepare('SELECT points, current_streak, last_checkin_date FROM users WHERE id = ?').get(userId) as { points: number; current_streak: number; last_checkin_date: string } | undefined
    if (!user) {
      db.prepare('ROLLBACK').run()
      return NextResponse.json({ code: -1, message: '用户不存在' }, { status: 404 })
    }

    const newStreak = user.last_checkin_date === yesterday ? user.current_streak + 1 : 1
    const newPoints = user.points + 10

    db.prepare(
      'UPDATE users SET points = points + 10, current_streak = ?, last_checkin_date = ? WHERE id = ?'
    ).run(newStreak, today, userId)

    db.prepare(
      "INSERT INTO points_history (user_id, amount, reason, type, detail) VALUES (?, 10, '每日签到', 'earn', '签到获得 10 积分')"
    ).run(userId)

    db.prepare('COMMIT').run()

    return NextResponse.json({
      code: 0,
      data: {
        success: true,
        points: 10,
        totalPoints: newPoints,
        streak: newStreak,
      },
    })
  } catch (e) {
    db.prepare('ROLLBACK').run()
    throw e
  }
}

export const POST = withAuth(handler)
