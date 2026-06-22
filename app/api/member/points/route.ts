import { NextResponse } from 'next/server'
import { getPointsRules } from '@/lib/services'
import { getDB } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'

async function handler(req: AuthenticatedRequest) {
  const db = getDB()
  const userId = req.user.id

  const user = db.prepare('SELECT points FROM users WHERE id = ?').get(userId) as { points: number } | undefined
  const history = db.prepare(
    'SELECT id, amount, reason, type, detail, created_at as date FROM points_history WHERE user_id = ? ORDER BY id DESC LIMIT 20'
  ).all(userId) as { id: number; amount: number; reason: string; type: string; detail: string; date: string }[]

  const rules = getPointsRules()

  const formattedHistory = history.map((r) => ({
    id: r.id,
    type: r.type === 'spend' ? ('redeem' as const) : (r.type as 'earn' | 'checkin'),
    description: r.reason,
    date: r.date?.slice(0, 10) || '',
    amount: r.amount,
  }))

  return NextResponse.json({
    code: 0,
    data: {
      points: user?.points ?? 0,
      history: formattedHistory,
      rules,
    },
  })
}

export const GET = withAuth(handler)
