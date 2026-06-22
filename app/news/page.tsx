'use client'

import { useState, useEffect } from 'react'
import NewsCard from '@/app/components/news/NewsCard'
import NewsFilter from '@/app/components/news/NewsFilter'
import BreakingNews from '@/app/components/news/BreakingNews'

interface NewsItem {
  id: string
  title: string
  summary: string
  thumbnail: string
  category: string
  source: string
  publishedAt: string
  url: string
  breaking: boolean
}

interface NewsData {
  breaking: NewsItem[]
  items: NewsItem[]
  total: number
  categories: string[]
}

export default function NewsPage() {
  const [data, setData] = useState<NewsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('全部')
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    const url = category === '全部' ? '/api/news' : `/api/news?category=${encodeURIComponent(category)}`
    fetch(url)
      .then(r => r.json())
      .then(json => {
        if (json.code === 0) setData(json.data)
        else setError('新闻加载失败，请稍后重试')
      })
      .catch(() => setError('网络错误'))
      .finally(() => setLoading(false))
  }, [category])

  return (
    <div className="px-8 md:px-16 py-10 pb-16">
      <div className="max-w-6xl mx-auto">
        {/* 页头 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-serif text-[var(--neon-cyan)]">体育新闻</h1>
          {data && (
            <span className="text-xs text-[#505870]">共 {data.total} 条</span>
          )}
        </div>

        {/* 突发新闻 */}
        {data && data.breaking.length > 0 && (
          <div className="mb-6">
            <BreakingNews items={data.breaking} />
          </div>
        )}

        {/* 筛选器 */}
        {data && (
          <div className="mb-6">
            <NewsFilter
              categories={data.categories}
              active={category}
              onChange={setCategory}
            />
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-[#0c0c18] border border-[rgba(0,229,255,0.1)] rounded-lg animate-pulse">
                <div className="h-40 bg-[rgba(0,229,255,0.08)]/50" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-[rgba(0,229,255,0.08)]/50 rounded w-3/4" />
                  <div className="h-3 bg-[rgba(0,229,255,0.08)]/50 rounded w-full" />
                  <div className="h-3 bg-[rgba(0,229,255,0.08)]/50 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-16">
            <p className="text-[#505870]">{error}</p>
            <button
              onClick={() => { setCategory('全部') }}
              className="mt-3 text-sm text-[var(--neon-cyan)] hover:underline"
            >
              重试
            </button>
          </div>
        )}

        {/* 空状态 */}
        {data && data.items.length === 0 && !loading && (
          <div className="text-center py-16 text-[#505870]">
            <p className="text-lg mb-2">暂无新闻</p>
            <p className="text-sm">当前分类下没有新闻内容</p>
          </div>
        )}

        {/* 新闻网格 */}
        {data && data.items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.items.map(item => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
