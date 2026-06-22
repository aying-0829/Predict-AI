import { NextRequest, NextResponse } from 'next/server'
import { MOCK_NEWS } from '@/lib/mock-news'
import { fetchLatestNews } from '@/lib/newsFetcher'
import { getDB } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get('category') || ''

  let news = MOCK_NEWS

  try {
    const db = getDB()
    const realNews = await fetchLatestNews(db)
    if (realNews && realNews.length > 0) {
      news = realNews
    }
  } catch {
    // Fallback to MOCK_NEWS
  }

  if (category && category !== '全部') {
    news = news.filter(item => item.category === category)
  }

  news.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  const breaking = news.filter(n => n.breaking)
  const normal = news.filter(n => !n.breaking)

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
