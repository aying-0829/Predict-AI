import { Suspense } from 'react'
import { getDB } from '@/lib/db'
import LiveMatchClient from './LiveMatchClient'

export const dynamic = 'force-dynamic'

interface MatchData {
  id: number
  source_id: number
  home_team: string
  away_team: string
  home_score: number | null
  away_score: number | null
  home_scorers: string
  away_scorers: string
  status: string
  group_name: string
  stadium: string
  match_date: string
  match_time: string
  time_elapsed: string
  matchday: number | null
  match_type: string
  finished: number
}

export default async function LiveMatchPage({
  params,
}: {
  params: Promise<{ matchId: string }>
}) {
  const { matchId } = await params
  const db = getDB()

  const match = db.prepare(`
    SELECT * FROM wc_matches WHERE id = ? OR source_id = ?
  `).get(matchId, matchId) as MatchData | undefined

  if (!match) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-[var(--text-dim)]">
        <div className="text-center">
          <p className="text-lg mb-4">Match not found</p>
          <a href="/live" className="text-[var(--neon-cyan)] hover:underline">Back to Live</a>
        </div>
      </div>
    )
  }

  const allMatches = db.prepare(`
    SELECT id, source_id, home_team, away_team, home_score, away_score,
           status, group_name, finished, match_date, match_time
    FROM wc_matches
    WHERE home_team != '' AND away_team != ''
    ORDER BY match_date ASC, match_time ASC
  `).all() as MatchData[]

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh] text-[var(--text-dim)]">
          Loading...
        </div>
      }
    >
      <LiveMatchClient match={match} allMatches={allMatches} />
    </Suspense>
  )
}
