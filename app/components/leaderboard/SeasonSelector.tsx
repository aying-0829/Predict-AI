'use client'

interface Props { currentSeason: string; onSeasonChange: (season: string) => void }

const SEASONS = [
  { value: 'current', label: '本赛季' },
  { value: '2026-q2', label: '2026 Q2' },
  { value: '2026-q1', label: '2026 Q1' },
]

export default function SeasonSelector({ currentSeason, onSeasonChange }: Props) {
  return (
    <div className="flex gap-2">
      {SEASONS.map(s => (
        <button key={s.value} onClick={() => onSeasonChange(s.value)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            currentSeason === s.value
              ? 'bg-[var(--neon-cyan)]/15 text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/30'
              : 'text-[var(--text-dim)] border border-[var(--neon-cyan)]/10 hover:border-[var(--neon-cyan)]/30'
          }`}
          style={currentSeason === s.value ? { boxShadow: '0 0 12px rgba(0,229,255,0.12)' } : { background: 'rgba(10,13,28,0.5)' }}>
          {s.label}
        </button>
      ))}
    </div>
  )
}
