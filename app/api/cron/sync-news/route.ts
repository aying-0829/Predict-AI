import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth =
    new URL(request.url).searchParams.get('token') ||
    request.headers.get('Authorization')?.replace('Bearer ', '')

  if (auth !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getDB()
  let synced = 0

  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 8000)

    const res = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/news',
      { signal: ctrl.signal }
    )

    clearTimeout(timer)

    if (res.ok) {
      const data = await res.json()
      const articles = data?.articles ?? []

      if (Array.isArray(articles) && articles.length > 0) {
        const insert = db.prepare(
          `INSERT OR REPLACE INTO news (id, title, summary, thumbnail, category, source, published_at, url, breaking)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )

        for (const a of articles.slice(0, 20)) {
          const id = `espn-${a.dataSourceIdentifier || a.id || Date.now()}-${synced}`
          const title = a.headline || a.title || ''
          if (!title) continue
          const summary = (a.description || a.summary || '').slice(0, 300)
          const thumbnail = a.images?.[0]?.url || ''
          const category = determineCategory(a.categories || a.sport || a.league || '')
          const publishedAt = a.published || a.publishedAt || new Date().toISOString()
          const url = a.links?.web?.href || a.link || '#'
          const breaking = synced < 2 ? 1 : 0

          insert.run(id, title, summary, thumbnail, category, 'ESPN', publishedAt, url, breaking)
          synced++
        }
      }
    }
  } catch {
    // ESPN API 失败
  }

  return NextResponse.json({
    success: true,
    synced,
    timestamp: new Date().toISOString(),
  })
}

function determineCategory(input: string | string[]): string {
  const str = Array.isArray(input) ? input.join(' ') : input
  const lower = str.toLowerCase()
  if (lower.includes('premier') || lower.includes('eng.1')) return '英超'
  if (lower.includes('laliga') || lower.includes('esp.1')) return '西甲'
  if (lower.includes('serie') || lower.includes('ita.1')) return '意甲'
  if (lower.includes('bundesliga') || lower.includes('ger.1')) return '德甲'
  if (lower.includes('world cup') || lower.includes('fifa')) return '世界杯'
  return '世界杯'
}
