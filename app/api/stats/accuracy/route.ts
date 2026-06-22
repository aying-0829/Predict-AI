import { NextResponse } from 'next/server'
import { getAccuracyBreakdown } from '@/lib/services'
import { getDB } from '@/lib/db'
import { withOptionalAuth, OptionalAuthRequest } from '@/lib/middleware'

async function handler(req: OptionalAuthRequest) {
  if (!req.user) {
    return NextResponse.json({ code: 0, data: getAccuracyBreakdown() })
  }

  try {
    const db = getDB()
    const userId = req.user.id

    const user = db.prepare('SELECT total_predictions, total_hits, longest_streak FROM users WHERE id = ?').get(userId) as { total_predictions: number; total_hits: number; longest_streak: number } | undefined

    const total = user?.total_predictions || 0
    const hits = user?.total_hits || 0
    const misses = total - hits

    return NextResponse.json({
      code: 0,
      data: {
        hits,
        misses: misses > 0 ? misses : 0,
        partials: 0,
        maxStreak: user?.longest_streak || 12,
      },
    })
  } catch {
    return NextResponse.json({ code: 0, data: getAccuracyBreakdown() })
  }
}

export const GET = withOptionalAuth(handler)
