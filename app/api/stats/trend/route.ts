import { NextResponse } from 'next/server'
import { getRecentTrend } from '@/lib/services'
import { getDB } from '@/lib/db'
import { withOptionalAuth, OptionalAuthRequest } from '@/lib/middleware'
import { fetchLotteryHistory, type LotteryType, type LotteryDraw } from '@/lib/lotteryApi'

async function handler(req: OptionalAuthRequest) {
  if (!req.user) {
    const realDraws = await fetchRealDraws()
    return NextResponse.json({ code: 0, data: { trend: getRecentTrend(), realDraws } })
  }

  const userId = req.user.id
  try {
    const db = getDB()
    const rows = db.prepare(
      "SELECT date(created_at) as date, COUNT(*) as total, SUM(is_hit) as hits FROM predictions WHERE user_id = ? AND created_at >= date('now','localtime','-7 days') GROUP BY date(created_at) ORDER BY date(created_at) ASC",
    ).all(userId) as { date: string; total: number; hits: number }[]

    const trend = rows.map((r) => ({
      date: r.date,
      hitCount: r.hits || 0,
      detail: `${r.hits || 0}/${r.total} 命中`,
    }))

    if (trend.length === 0) {
      const realDraws = await fetchRealDraws()
      return NextResponse.json({ code: 0, data: { trend: getRecentTrend(), realDraws } })
    }

    const realDraws = await fetchRealDraws()
    return NextResponse.json({ code: 0, data: { trend, realDraws } })
  } catch {
    return NextResponse.json({ code: 0, data: { trend: getRecentTrend(), realDraws: null } })
  }
}

export const GET = withOptionalAuth(handler)

async function fetchRealDraws() {
  try {
    const [ssqDraws, dltDraws] = await Promise.all([
      fetchLotteryHistory('ssq' as LotteryType, 3),
      fetchLotteryHistory('dlt' as LotteryType, 3),
    ])
    const fmt = (draws: LotteryDraw[] | null) =>
      (draws || []).map((d) => ({ period: d.period, numbers: d.raw, date: d.date }))
    return {
      ssq: fmt(ssqDraws),
      dlt: fmt(dltDraws),
    }
  } catch {
    return null
  }
}
