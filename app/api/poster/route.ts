import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { withAuth, AuthenticatedRequest } from '@/lib/middleware'

type TemplateType = 'stats' | 'streak' | 'badge' | 'winstreak-flame' | 'predict-compare' | 'invite'

async function handler(request: AuthenticatedRequest) {
  const { searchParams } = new URL(request.url)
  const template = (searchParams.get('template') as TemplateType) || 'stats'

  const db = getDB()
  const userId = request.user.id

  const user = db.prepare(
    'SELECT total_predictions, total_hits, current_streak, longest_streak, rank, nickname, avatar_url FROM users WHERE id = ?'
  ).get(userId) as {
    total_predictions: number; total_hits: number; current_streak: number;
    longest_streak: number; rank: number; nickname: string; avatar_url: string
  } | undefined

  const totalPredictions = user?.total_predictions || 0
  const totalHits = user?.total_hits || 0
  const accuracy = totalPredictions > 0 ? Math.round((totalHits / totalPredictions) * 1000) / 10 : 0

  const weeklyRow = db.prepare(
    "SELECT COUNT(*) as cnt FROM predictions WHERE user_id = ? AND created_at >= date('now','localtime','-7 days')"
  ).get(userId) as { cnt: number }

  const base = {
    accuracy,
    totalPredictions,
    hits: totalHits,
    recentPredictions: weeklyRow?.cnt || 0,
    rank: user?.rank || 42,
    overPercent: 89,
    streak: user?.current_streak || 0,
    template: template as 'stats' | 'streak' | 'badge' | 'winstreak-flame' | 'predict-compare' | 'invite',
    nickname: user?.nickname || 'Predictor',
    avatarUrl: user?.avatar_url || '',
  }

  if (template === 'streak') {
    return NextResponse.json({
      code: 0,
      data: {
        ...base,
        maxStreak: user?.longest_streak || 12,
        recentResults: [] as { date: string; result: string; hit: boolean }[],
      },
    })
  }

  if (template === 'badge') {
    return NextResponse.json({
      code: 0,
      data: {
        ...base,
        unlockedBadges: [] as { name: string; icon: string; unlockedAt: string }[],
        lockedBadges: [] as { name: string; icon: string; requirement: string }[],
      },
    })
  }

  if (template === 'winstreak-flame') {
    return NextResponse.json({
      code: 0,
      data: {
        ...base,
        maxStreak: user?.longest_streak || 12,
      },
    })
  }

  if (template === 'predict-compare') {
    return NextResponse.json({
      code: 0,
      data: {
        ...base,
        recentResults: [] as { date: string; prediction: string; actual: string; correct: boolean }[],
      },
    })
  }

  if (template === 'invite') {
    return NextResponse.json({
      code: 0,
      data: {
        ...base,
        inviteCode: `PREDICT${String(base.rank).padStart(4, '0')}`,
        rewardPoints: 200,
      },
    })
  }

  return NextResponse.json({ code: 0, data: base })
}

export const GET = withAuth(handler)
