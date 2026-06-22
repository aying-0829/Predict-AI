'use client'

interface Topic {
  tag: string
  count: number
}

interface Props {
  topics: Topic[]
}

export default function HotTopics({ topics }: Props) {
  if (topics.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {topics.map((t) => (
        <span
          key={t.tag}
          className="px-3 py-1.5 rounded-full text-xs bg-[#0c0c18] border border-[rgba(0,229,255,0.1)] text-[#e8e8f0] hover:border-[var(--neon-cyan)]/50 hover:text-[var(--neon-cyan)] cursor-pointer transition-all"
        >
          #{t.tag}
          <span className="text-[#505870] ml-1">{t.count}</span>
        </span>
      ))}
    </div>
  )
}
