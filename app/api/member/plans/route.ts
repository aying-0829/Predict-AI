import { NextResponse } from 'next/server'
import { getMemberPlans, getMemberFeatures } from '@/lib/services'
import { getDB } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'

async function handler(req: AuthenticatedRequest) {
  const db = getDB()
  const userId = req.user.id

  const user = db.prepare('SELECT membership_type, points FROM users WHERE id = ?').get(userId) as { membership_type: string; points: number } | undefined

  const plans = getMemberPlans()
  const features = getMemberFeatures()
  return NextResponse.json({
    code: 0,
    data: {
      plans,
      features,
      currentType: user?.membership_type || 'free',
      currentPoints: user?.points || 0,
    },
  })
}

export const GET = withAuth(handler)
