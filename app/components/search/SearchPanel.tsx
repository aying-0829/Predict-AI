'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id: string
  type: 'match' | 'lottery' | 'user'
  title: string
  subtitle: string
  url: string
}

interface SearchData {
  matches: SearchResult[]
  lottery: SearchResult[]
  users: SearchResult[]
}

interface SearchPanelProps {
  open: boolean
  onClose?: () => void
}

export default function SearchPanel({ open, onClose }: SearchPanelProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchData>({ matches: [], lottery: [], users: [] })
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const router = useRouter()

  const handleClose = useCallback(() => {
    onClose?.()
  }, [onClose])

  // Esc 关闭
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.()
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [onClose])

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
      setQuery('')
      setResults({ matches: [], lottery: [], users: [] })
      setActiveIndex(0)
    }
  }, [open])

  // debounce 搜索
  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 1) {
      setResults({ matches: [], lottery: [], users: [] })
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const json = await res.json()
      setResults(json.data || { matches: [], lottery: [], users: [] })
      setActiveIndex(0)
    } catch {
      setResults({ matches: [], lottery: [], users: [] })
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInput = (val: string) => {
    setQuery(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => doSearch(val), 300)
  }

  // 构建扁平化结果列表用于键盘导航
  const flatResults: { item: SearchResult; section: string }[] = []
  if (results.matches.length > 0) {
    results.matches.forEach(item => flatResults.push({ item, section: '赛事' }))
  }
  if (results.lottery.length > 0) {
    results.lottery.forEach(item => flatResults.push({ item, section: '彩票预测' }))
  }
  if (results.users.length > 0) {
    results.users.forEach(item => flatResults.push({ item, section: '用户' }))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => Math.min(prev + 1, flatResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && flatResults[activeIndex]) {
      e.preventDefault()
      router.push(flatResults[activeIndex].item.url)
      handleClose()
    }
  }

  const goTo = (url: string) => {
    router.push(url)
    handleClose()
  }

  if (!open) return null

  const sectionNames: Record<string, string> = { match: '赛事', lottery: '彩票预测', user: '用户' }
  const hasResults = flatResults.length > 0

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-full max-w-xl">
        <div className="bg-[#0c0c18] border border-[rgba(0,229,255,0.1)] rounded-xl shadow-2xl overflow-hidden">
          {/* 搜索框 */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgba(0,229,255,0.1)]">
            <svg className="w-5 h-5 text-[#505870] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => handleInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="搜索赛事、彩票、用户..."
              className="flex-1 bg-transparent text-[#e8e8f0] placeholder-gray-500 outline-none text-sm"
            />
            <kbd className="text-xs text-[#505870] bg-[rgba(0,229,255,0.08)] px-2 py-0.5 rounded border border-[rgba(0,229,255,0.1)]">
              ESC
            </kbd>
          </div>

          {/* 结果区 */}
          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <div className="px-5 py-8 text-center text-sm text-[#505870]">
                <div className="animate-pulse">搜索中...</div>
              </div>
            )}

            {!loading && !hasResults && query.trim() && (
              <div className="px-5 py-8 text-center text-sm text-[#505870]">
                未找到 &quot;{query}&quot; 相关结果
              </div>
            )}

            {!loading && !hasResults && !query.trim() && (
              <div className="px-5 py-8 text-center text-sm text-[#505870]">
                输入关键词搜索赛事、彩票预测或用户
              </div>
            )}

            {!loading && hasResults && (
              <div className="py-2">
                {['matches', 'lottery', 'users'].map(section => {
                  const items = results[section as keyof SearchData] as SearchResult[]
                  if (items.length === 0) return null
                  return (
                    <div key={section}>
                      <div className="px-5 pt-3 pb-1 text-xs font-semibold text-[var(--neon-cyan)] uppercase tracking-wider">
                        {sectionNames[items[0].type]}
                      </div>
                      {items.map((item, _idx) => {
                        const globalIdx = flatResults.findIndex(f => f.item.id === item.id)
                        const isActive = globalIdx === activeIndex
                        return (
                          <button
                            key={item.id}
                            className={`w-full text-left px-5 py-2.5 flex items-center gap-3 hover:bg-[rgba(0,229,255,0.08)]/50 transition-colors ${
                              isActive ? 'bg-[rgba(0,229,255,0.08)]/80 border-l-2 border-[rgba(0,229,255,0.3)]' : 'border-l-2 border-transparent'
                            }`}
                            onClick={() => goTo(item.url)}
                            onMouseEnter={() => setActiveIndex(globalIdx)}
                          >
                            <span className={`text-lg flex-shrink-0 w-7 h-7 flex items-center justify-center rounded ${
                              item.type === 'match' ? 'bg-blue-900/40 text-blue-400' :
                              item.type === 'lottery' ? 'bg-amber-900/40 text-amber-400' :
                              'bg-green-900/40 text-green-400'
                            }`}>
                              {item.type === 'match' ? '⚽' : item.type === 'lottery' ? '🎱' : '👤'}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm text-[#e8e8f0] truncate">{item.title}</div>
                              <div className="text-xs text-[#505870] truncate">{item.subtitle}</div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 底部提示 */}
          <div className="px-5 py-2 border-t border-[rgba(0,229,255,0.1)] flex gap-4 text-xs text-[#9098b0]">
            <span>↑↓ 导航</span>
            <span>↵ 选择</span>
            <span>Esc 关闭</span>
          </div>
        </div>
      </div>
    </div>
  )
}
