import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'
import { ensureUserAchievements, ACHIEVEMENTS, getAchievementDef } from '@/lib/services/achievements'

async function handler(req: AuthenticatedRequest) {
  const db = getDB()
  const userId = req.user.id
  ensureUserAchievements(db, userId)

  const records = db.prepare(
    'SELECT achievement_key, unlocked_at, progress, target FROM user_achievements WHERE user_id = ? ORDER BY unlocked_at DESC, achievement_key ASC'
  ).all(userId) as Array<{ achievement_key: string; unlocked_at: string | null; progress: number; target: number }>

  const list = records.map((r) => {
    const def = getAchievementDef(r.achievement_key)
    return {
      key: r.achievement_key,
      name: def?.name || r.achievement_key,
      description: def?.description || '',
      icon: def?.icon || '🏅',
      category: def?.category || 'special',
      unlocked: !!r.unlocked_at,
      unlockedAt: r.unlocked_at,
      progress: r.progress,
      target: r.target,
    }
  })

  const unlockedCount = list.filter((a) => a.unlocked).length

  return NextResponse.json({
    code: 0,
    data: {
      total: ACHIEVEMENTS.length,
      unlocked: unlockedCount,
      list,
    },
  })
}

export const GET = withAuth(handler)
