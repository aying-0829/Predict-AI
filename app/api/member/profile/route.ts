import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'

async function handler(req: AuthenticatedRequest) {
  const db = getDB()
  const userId = req.user.id

  const user = db.prepare(
    'SELECT id, username, membership_type, membership_expire, points, total_predictions, total_hits, current_streak, longest_streak, rank FROM users WHERE id = ?'
  ).get(userId) as Record<string, unknown> | undefined

  if (!user) {
    return NextResponse.json({ code: -1, message: '用户不存在' }, { status: 404 })
  }

  // BugFix-7: 从实际签到数据计算 checkinDays，不再硬编码 87
  const checkinRow = db.prepare(
    "SELECT COUNT(DISTINCT substr(created_at, 1, 10)) as cnt FROM points_history WHERE user_id = ? AND reason = '每日签到'"
  ).get(userId) as { cnt: number } | undefined
  const checkinDays = checkinRow?.cnt ?? 0

  const planNameMap: Record<string, string> = { free: '免费用户', monthly: '月卡会员', quarterly: '季卡会员', yearly: '年卡会员' }

  const profile = {
    name: (user.username as string) || 'Marvis',
    plan: user.membership_type as string,
    planName: planNameMap[user.membership_type as string] || '免费用户',
    expireDate: user.membership_expire as string || '',
    totalPredictions: user.total_predictions as number,
    checkinDays,
    points: user.points as number,
  }

  return NextResponse.json({ code: 0, data: profile })
}

export const GET = withAuth(handler)
