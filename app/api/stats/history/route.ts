import { NextResponse } from 'next/server'
import { getPredictionHistory } from '@/lib/services'
import { getDB } from '@/lib/db'
import { withOptionalAuth, OptionalAuthRequest } from '@/lib/middleware'
import { fetchOverviewLatest } from '@/lib/lotteryApi'

async function handler(request: OptionalAuthRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || undefined
  const limit = parseInt(searchParams.get('limit') || '20', 10)

  if (!request.user) {
    return NextResponse.json({ code: 0, data: { list: getPredictionHistory(type, limit), latestDraws: { ssq: null, dlt: null } } })
  }

  const userId = request.user.id

  try {
    const db = getDB()

    let query = 'SELECT id, lottery_type, numbers, result, ai_numbers, hit, is_hit, created_at FROM predictions WHERE user_id = ? '
    const params: unknown[] = [userId]

    if (type && type !== 'all') {
      if (type === 'hit') {
        query += 'AND is_hit = 1 '
      } else if (type === 'miss') {
        query += 'AND is_hit = 0 '
      } else {
        query += 'AND lottery_type = ? '
        params.push(type)
      }
    }

    query += 'ORDER BY created_at DESC LIMIT ?'
    params.push(limit)

    const rows = db.prepare(query).all(...params) as {
      id: number; lottery_type: string; numbers: string; result: string;
      ai_numbers: string; hit: number; is_hit: number; created_at: string
    }[]

    const typeMap: Record<string, 'ssq' | 'dlt' | 'worldcup'> = {
      ssq: 'ssq', dlt: 'dlt', '3d': 'worldcup', sport: 'worldcup', pl5: 'worldcup',
    }

    const records = rows.map((r) => ({
      id: r.id,
      date: r.created_at?.slice(0, 10) || '',
      type: typeMap[r.lottery_type] || 'ssq',
      prediction: r.numbers,
      actual: r.result || null,
      result: (r.result ? (r.is_hit ? 'hit' : (r.hit >= 3 ? 'partial' : 'miss')) : 'pending') as 'hit' | 'miss' | 'partial' | 'pending',
      hitDetail: r.is_hit ? '命中' : (r.hit >= 3 ? `命中 ${r.hit} 个` : '未命中'),
      points: r.is_hit ? 20 : (r.hit >= 3 ? 5 : 0),
    }))

    let latestDraws: Record<string, { period: string; numbers: string; date: string } | null> = { ssq: null, dlt: null }
    try {
      const overviewLatest = await fetchOverviewLatest()
      latestDraws = {
        ssq: overviewLatest.ssq ? { period: overviewLatest.ssq.period, numbers: overviewLatest.ssq.raw, date: overviewLatest.ssq.date } : null,
        dlt: overviewLatest.dlt ? { period: overviewLatest.dlt.period, numbers: overviewLatest.dlt.raw, date: overviewLatest.dlt.date } : null,
      }
    } catch { /* 降级为空 */ }

    return NextResponse.json({ code: 0, data: { list: records, latestDraws } })
  } catch {
    return NextResponse.json({ code: 0, data: { list: getPredictionHistory(type, limit), latestDraws: { ssq: null, dlt: null } } })
  }
}

export const GET = withOptionalAuth(handler)
