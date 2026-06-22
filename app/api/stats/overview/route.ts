import { NextResponse } from 'next/server'
import { getKpiStats } from '@/lib/services'
import { getDB } from '@/lib/db'
import { withOptionalAuth, OptionalAuthRequest } from '@/lib/middleware'
import { fetchOverviewLatest } from '@/lib/lotteryApi'

async function handler(req: OptionalAuthRequest) {
  // 未登录 → 从 users 表读取所有用户平均准确率
  if (!req.user) {
    try {
      const db = getDB()
      const avgRow = db.prepare(
        'SELECT COALESCE(SUM(total_hits), 0) as totalHits, COALESCE(SUM(total_predictions), 0) as totalPreds FROM users'
      ).get() as { totalHits: number; totalPreds: number }
      const avgAccuracy = avgRow.totalPreds > 0 ? Math.round((avgRow.totalHits / avgRow.totalPreds) * 1000) / 10 : 0
      const _mock = getKpiStats()
      return NextResponse.json({
        code: 0,
        data: { totalPredictions: avgRow.totalPreds, accuracy: avgAccuracy, accuracyChange: 0, checkinDays: 0, points: 0, weeklyPredictions: 0, latestDraw: { ssq: null, dlt: null } },
      })
    } catch {
      const mock = getKpiStats()
      return NextResponse.json({ code: 0, data: { ...mock, latestDraw: { ssq: null, dlt: null } } })
    }
  }

  try {
    const db = getDB()
    const userId = req.user.id

    const user = db.prepare(
      'SELECT total_predictions, total_hits, points, current_streak FROM users WHERE id = ?'
    ).get(userId) as { total_predictions: number; total_hits: number; points: number; current_streak: number } | undefined

    const weeklyRow = db.prepare(
      "SELECT COUNT(*) as cnt FROM predictions WHERE user_id = ? AND created_at >= date('now','localtime','-7 days')"
    ).get(userId) as { cnt: number }

    const totalPredictions = user?.total_predictions || 0
    const totalHits = user?.total_hits || 0
    const accuracy = totalPredictions > 0 ? Math.round((totalHits / totalPredictions) * 1000) / 10 : 0

    let latestDraw: Record<string, { period: string; numbers: string; date: string } | null> = { ssq: null, dlt: null }
    try {
      const overviewLatest = await fetchOverviewLatest()
      latestDraw = {
        ssq: overviewLatest.ssq ? { period: overviewLatest.ssq.period, numbers: overviewLatest.ssq.raw, date: overviewLatest.ssq.date } : null,
        dlt: overviewLatest.dlt ? { period: overviewLatest.dlt.period, numbers: overviewLatest.dlt.raw, date: overviewLatest.dlt.date } : null,
      }
    } catch { /* 降级为空 */ }

    return NextResponse.json({
      code: 0,
      data: {
        totalPredictions,
        accuracy,
        accuracyChange: 2.1,
        checkinDays: user?.current_streak || 0,
        points: user?.points || 0,
        weeklyPredictions: weeklyRow?.cnt || 0,
        latestDraw,
      },
    })
  } catch {
    const mock = getKpiStats()
    return NextResponse.json({ code: 0, data: { ...mock, latestDraw: { ssq: null, dlt: null } } })
  }
}

export const GET = withOptionalAuth(handler)
