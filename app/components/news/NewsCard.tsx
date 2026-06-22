'use client'

import { useRouter } from 'next/navigation'

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

interface NewsCardProps {
  item: NewsItem
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  return `${days}天前`
}

export default function NewsCard({ item }: NewsCardProps) {
  const router = useRouter()

  const handleClick = () => {
    if (item.url && item.url !== '#') {
      window.open(item.url, '_blank')
    } else {
      router.push(`/news/${item.id}`)
    }
  }

  return (
    <article
      onClick={handleClick}
      className="bg-[#0c0c18] rounded-lg border border-[rgba(0,229,255,0.1)] hover:border-[var(--neon-cyan)]/50 transition-all duration-300 overflow-hidden group cursor-pointer gold-glow-hover">
      {/* 缩略图区 */}
      <div className="h-40 bg-gradient-to-br from-[rgba(0,229,255,0.08)] to-[#0c0c18] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c18]/80 to-transparent" />
        <span className="text-5xl opacity-30 group-hover:opacity-50 transition-opacity">
          {item.category === '世界杯' ? '🏆' :
           item.category === '英超' ? '🦁' :
           item.category === '西甲' ? '👑' :
           item.category === '意甲' ? '🍝' :
           item.category === '德甲' ? '⚡' : '📰'}
        </span>
        <div className="absolute top-3 left-3">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            item.category === '世界杯' ? 'bg-blue-900/60 text-blue-300' :
            item.category === '英超' ? 'bg-purple-900/60 text-purple-300' :
            item.category === '西甲' ? 'bg-red-900/60 text-red-300' :
            item.category === '意甲' ? 'bg-green-900/60 text-green-300' :
            item.category === '德甲' ? 'bg-orange-900/60 text-orange-300' :
            'bg-gray-700 text-[#e8e8f0]'
          }`}>
            {item.category}
          </span>
        </div>
        {item.breaking && (
          <div className="absolute top-3 right-3 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
            BREAKING
          </div>
        )}
      </div>

      {/* 内容区 */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-[#e8e8f0] line-clamp-2 group-hover:text-[var(--neon-cyan)] transition-colors leading-snug">
          {item.title}
        </h3>
        <p className="text-xs text-[#505870] mt-2 line-clamp-2 leading-relaxed">
          {item.summary}
        </p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgba(0,229,255,0.1)]">
          <span className="text-xs text-[#9098b0]">{item.source}</span>
          <span className="text-xs text-[#9098b0]">{timeAgo(item.publishedAt)}</span>
        </div>
      </div>
    </article>
  )
}
