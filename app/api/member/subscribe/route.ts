import { NextResponse } from 'next/server'
import { getMemberPlans } from '@/lib/services'
import { getDB } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'

async function handler(req: AuthenticatedRequest) {
  const { planId } = await req.json()
  if (!planId) {
    return NextResponse.json({ code: -1, message: '缺少 planId 参数' }, { status: 400 })
  }

  const db = getDB()
  const userId = req.user.id
  const plans = getMemberPlans()
  const plan = plans.find(p => p.id === planId)
  if (!plan) {
    return NextResponse.json({ code: -1, message: '无效的方案 ID' }, { status: 400 })
  }

  const user = db.prepare('SELECT points, membership_type FROM users WHERE id = ?').get(userId) as { points: number; membership_type: string } | undefined
  if (!user) {
    return NextResponse.json({ code: -1, message: '用户不存在' }, { status: 404 })
  }

  // 计算到期时间
  const now = new Date()
  const expireDate = new Date(now)
  if (planId === 'monthly') expireDate.setMonth(expireDate.getMonth() + 1)
  else if (planId === 'quarterly') expireDate.setMonth(expireDate.getMonth() + 3)
  else if (planId === 'yearly') expireDate.setFullYear(expireDate.getFullYear() + 1)
  const expireStr = expireDate.toISOString().slice(0, 10)

  // TOCTOU 防护：事务内完成积分检查 + 扣减
  const cost = plan.price
  db.prepare('BEGIN IMMEDIATE').run()
  try {
    // 事务内重新读取积分
    const freshUser = db.prepare('SELECT points FROM users WHERE id = ?').get(userId) as { points: number } | undefined
    if (!freshUser || freshUser.points < cost) {
      db.prepare('ROLLBACK').run()
      return NextResponse.json({
        code: -1,
        message: `积分不足，当前积分 ${freshUser?.points ?? 0}，需要 ${cost} 积分`,
      }, { status: 400 })
    }

    const newPoints = freshUser.points - cost
    db.prepare('UPDATE users SET membership_type = ?, membership_expire = ?, points = ? WHERE id = ?').run(planId, expireStr, newPoints, userId)

    db.prepare(
      'INSERT INTO points_history (user_id, amount, reason, type, detail) VALUES (?, ?, ?, ?, ?)'
    ).run(userId, -cost, `订阅 ${plan.name}`, 'spend', `${plan.name}订阅`)

    db.prepare('COMMIT').run()

    return NextResponse.json({
      code: 0,
      data: {
        success: true,
        plan: plan.name,
        expireDate: expireStr,
        cost,
        remainingPoints: newPoints,
      },
    })
  } catch (e) {
    db.prepare('ROLLBACK').run()
    throw e
  }
}

export const POST = withAuth(handler)
