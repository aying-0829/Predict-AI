import { NextResponse } from 'next/server'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { checkAllAchievements, getAchievementDef } from '@/lib/services/achievements'

async function handler(req: AuthenticatedRequest) {
  const result = checkAllAchievements(req.user.id)

  const unlockedDetails = result.unlocked.map((key) => {
    const def = getAchievementDef(key)
    return { key, name: def?.name || key, icon: def?.icon || '🏅' }
  })

  return NextResponse.json({
    code: 0,
    data: {
      newlyUnlocked: unlockedDetails,
      progress: result.progress,
    },
  })
}

export const POST = withAuth(handler)
