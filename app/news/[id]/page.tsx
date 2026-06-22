'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface NewsDetail {
  id: string
  title: string
  summary: string
  content: string
  category: string
  source: string
  publishedAt: string
}

export default function NewsDetailPage() {
  const params = useParams()
  const [news, setNews] = useState<NewsDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/news/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.code === 0) setNews(data.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06060c] flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-2xl px-6">
          <div className="h-8 bg-[#0c0c18] rounded w-3/4" />
          <div className="h-4 bg-[#0c0c18] rounded w-1/2" />
          <div className="h-4 bg-[#0c0c18] rounded w-1/3" />
          <div className="h-64 bg-[#0c0c18] rounded" />
        </div>
      </div>
    )
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-[#06060c] flex items-center justify-center">
        <p className="text-[#505870]">新闻不存在或已被删除</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#06060c]">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-blue-900/60 text-blue-300">
          {news.category}
        </span>
        <h1 className="text-3xl font-serif text-[var(--neon-cyan)] mt-4 mb-2">
          {news.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-[#505870] mb-8">
          <span>{news.source}</span>
          <span>
            {new Date(news.publishedAt).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
        <div className="prose max-w-none text-[#e8e8f0] leading-relaxed text-base whitespace-pre-wrap">
          {news.content || news.summary}
        </div>
      </div>
    </div>
  )
}
