'use client'

interface NewsItem {
  id: string
  title: string
  summary: string
  category: string
  publishedAt: string
}

interface BreakingNewsProps {
  items: NewsItem[]
}

export default function BreakingNews({ items }: BreakingNewsProps) {
  if (items.length === 0) return null

  return (
    <div className="bg-gradient-to-r from-red-900/30 via-[#0c0c18] to-red-900/30 border border-red-800/30 rounded-lg overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          <span className="text-xs font-bold text-red-400 uppercase tracking-widest">突发新闻</span>
        </div>
        <div className="flex-1 overflow-hidden relative h-6">
          <div className="animate-marquee whitespace-nowrap">
            {items.map((item, i) => (
              <span key={item.id} className="text-sm text-[#e8e8f0] mr-12">
                {item.title}
                {i < items.length - 1 && <span className="text-red-500 mx-4">|</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
      {items.length > 1 && (
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {items.map(item => (
            <span key={item.id} className="text-xs bg-red-900/40 text-red-300 px-2 py-1 rounded">
              {item.category}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
