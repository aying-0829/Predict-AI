'use client'

interface KpiCardProps {
  icon: string
  label: string
  value: string
  sub: string
  highlight?: boolean
}

export function KpiCard({ icon, label, value, sub, highlight }: KpiCardProps) {
  return (
    <div className={`card-premium p-5 hover:shadow-lg transition-shadow ${highlight ? 'border-[var(--neon-cyan)]/30' : ''}`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm text-[#9098b0]">{label}</span>
      </div>
      <div className={`text-3xl font-bold font-serif ${highlight ? 'text-[var(--neon-cyan)]' : 'text-white'}`}>
        {value}
      </div>
      <div className="text-xs text-[var(--neon-cyan)] mt-1">{sub}</div>
    </div>
  )
}
