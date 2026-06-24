import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const matchId = request.nextUrl.searchParams.get('matchId')
  if (!matchId) {
    return NextResponse.json({ events: [], match: null })
  }

  const db = getDB()

  const events = db.prepare(
    'SELECT * FROM match_events WHERE match_id = ? ORDER BY minute ASC'
  ).all(matchId) as any[]

  const match = db.prepare(
    'SELECT * FROM matches WHERE id = ?'
  ).get(matchId) as any

  const result = {
    events: events.map((e: any) => ({
      id: e.id,
      event_type: e.event_type,
      minute: e.minute,
      team: e.team,
      player_name: e.player_name,
      detail: e.detail,
      extra: JSON.parse(e.extra || '{}'),
    })),
    match: match ? {
      id: String(match.id),
      home: match.home_team,
      away: match.away_team,
      homeScore: match.home_score,
      awayScore: match.away_score,
      minute: match.minute,
      status: match.status,
    } : null,
  }

  return NextResponse.json(result)
}
