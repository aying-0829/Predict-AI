import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'

async function handler(req: AuthenticatedRequest) {
  const db = getDB()
  const userId = req.user.id

  // BugFix-3: 按 user_id 过滤积分记录，而非返回所有用户数据
  const history = db.prepare(
    'SELECT id, amount, reason, type, detail, created_at as date FROM points_history WHERE user_id = ? ORDER BY id DESC LIMIT 50'
  ).all(userId) as { id: number; amount: number; reason: string; type: string; detail: string; date: string }[]

  const formattedHistory = history.map((r) => ({
    id: r.id,
    type: r.type === 'spend' ? ('redeem' as const) : (r.type as 'earn' | 'checkin'),
    description: r.reason,
    date: r.date?.slice(0, 10) || '',
    amount: r.amount,
  }))

  return NextResponse.json({
    code: 0,
    data: formattedHistory,
  })
}

// BugFix-5: 加上 withAuth 鉴权，防止未登录用户获取积分记录
export const GET = withAuth(handler)
