import { getDB } from '@/lib/db'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function LivePage() {
  const db = getDB()

  const latestFinished = db
    .prepare(
      `SELECT id FROM wc_matches WHERE finished = 1 ORDER BY match_date DESC, match_time DESC LIMIT 1`
    )
    .get() as { id: number } | undefined

  if (latestFinished) {
    redirect(`/live/${latestFinished.id}`)
  }

  const anyMatch = db
    .prepare(`SELECT id FROM wc_matches ORDER BY match_date ASC LIMIT 1`)
    .get() as { id: number } | undefined

  if (anyMatch) {
    redirect(`/live/${anyMatch.id}`)
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] text-[var(--text-dim)]">
      <div className="text-center space-y-4">
        <p className="text-lg">暂无比赛数据</p>
        <p className="text-sm">
          请先访问{' '}
          <code className="bg-[rgba(10,13,28,0.5)] px-2 py-0.5 rounded text-[var(--neon-cyan)]">
            /api/world-cup/sync
          </code>{' '}
          同步数据
        </p>
      </div>
    </div>
  )
}
