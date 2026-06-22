'use client'

interface NewsFilterProps {
  categories: string[]
  active: string
  onChange: (cat: string) => void
}

export default function NewsFilter({ categories, active, onChange }: NewsFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
            active === cat
              ? 'bg-[var(--neon-cyan)] text-[#e8e8f0] shadow-lg shadow-[var(--neon-cyan)]/20'
              : 'bg-[#0c0c18] text-[#9098b0] border border-[rgba(0,229,255,0.1)] hover:border-[var(--neon-cyan)]/50 hover:text-[#e8e8f0]'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
