import { NextRequest, NextResponse } from 'next/server'
import { fetchLatestNews } from '@/lib/newsFetcher'
import { getDB } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get('category') || ''

  let news: any[] = []

  // 优先从 DB 读取
  try {
    const db = getDB()
    const dbNews = db.prepare('SELECT * FROM news ORDER BY published_at DESC').all() as any[]
    if (dbNews && dbNews.length > 0) {
      news = dbNews.map((n: any) => ({
        id: n.id,
        title: n.title,
        summary: n.summary,
        thumbnail: n.thumbnail,
        category: n.category,
        source: n.source,
        publishedAt: n.published_at,
        url: n.url,
        breaking: !!n.breaking,
      }))
    }
  } catch {
    // DB 读取失败
  }

  // 如果 DB 为空，尝试实时抓取 ESPN
  if (news.length === 0) {
    try {
      const realNews = await fetchLatestNews()
      if (realNews && realNews.length > 0) {
        news = realNews
      }
    } catch {
      // API 抓取失败
    }
  }

  if (category && category !== '全部') {
    news = news.filter((item: any) => item.category === category)
  }

  news.sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  const breaking = news.filter((n: any) => n.breaking)
  const normal = news.filter((n: any) => !n.breaking)

  return NextResponse.json({
    code: 0,
    data: {
      breaking,
      items: normal,
      total: news.length,
      categories: ['全部', '世界杯', '英超', '西甲', '意甲', '德甲', '彩票'],
    },
  })
}
