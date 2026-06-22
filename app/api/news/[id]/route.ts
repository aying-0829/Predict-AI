import { NextRequest, NextResponse } from 'next/server'
import { MOCK_NEWS } from '@/lib/mock-news'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const news = MOCK_NEWS.find(item => item.id === params.id)

  if (!news) {
    return NextResponse.json(
      { code: -1, message: '新闻不存在' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    code: 0,
    data: {
      id: news.id,
      title: news.title,
      summary: news.summary,
      content: (news as any).content || news.summary,
      category: news.category,
      source: news.source,
      publishedAt: news.publishedAt,
    },
  })
}
