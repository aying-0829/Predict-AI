import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const db = getDB()
  const rows = db.prepare('SELECT * FROM matches ORDER BY match_date, match_time').all() as any[]

  const matches = rows.map((r: any) => ({
    id: String(r.id),
    group: r.group_name || '',
    home: r.home_team,
    away: r.away_team,
    homeFlag: r.home_flag || '',
    awayFlag: r.away_flag || '',
    homeScore: r.home_score,
    awayScore: r.away_score,
    date: r.match_date || '',
    time: r.match_time || '',
    stadium: r.stadium || '',
    city: r.city || '',
    status: r.status || 'upcoming',
    minute: r.minute || null,
  }))

  return NextResponse.json(matches)
}
