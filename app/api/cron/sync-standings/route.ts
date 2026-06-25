import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { fetchWorldCupGroups } from '@/lib/footballApi'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth =
    new URL(request.url).searchParams.get('token') ||
    request.headers.get('Authorization')?.replace('Bearer ', '')

  if (auth !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getDB()
  let synced = 0

  try {
    const groups = await fetchWorldCupGroups()
    if (groups && groups.length > 0) {
      // Ensure standings table exists
      db.exec(`
        CREATE TABLE IF NOT EXISTS standings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          team_name TEXT NOT NULL,
          fifa_code TEXT DEFAULT '',
          group_name TEXT DEFAULT '',
          played INTEGER DEFAULT 0,
          won INTEGER DEFAULT 0,
          drawn INTEGER DEFAULT 0,
          lost INTEGER DEFAULT 0,
          goals_for INTEGER DEFAULT 0,
          goals_against INTEGER DEFAULT 0,
          goal_diff INTEGER DEFAULT 0,
          points INTEGER DEFAULT 0,
          updated_at TEXT DEFAULT (datetime('now','localtime'))
        )
      `)

      const upsert = db.prepare(`
        INSERT INTO standings (team_name, fifa_code, group_name, played, won, drawn, lost, goals_for, goals_against, goal_diff, points)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(team_name, group_name) DO UPDATE SET
          fifa_code = excluded.fifa_code,
          played = excluded.played,
          won = excluded.won,
          drawn = excluded.drawn,
          lost = excluded.lost,
          goals_for = excluded.goals_for,
          goals_against = excluded.goals_against,
          goal_diff = excluded.goal_diff,
          points = excluded.points,
          updated_at = datetime('now','localtime')
      `)

      for (const g of groups) {
        const groupName = g.group || g.name || ''
        const teams = g.teams || g.standings || []
        for (const t of teams) {
          const teamName = t.name || t.team || ''
          if (!teamName) continue
          const fifaCode = t.fifa_code || ''
          const played = Number(t.mp || t.played || 0)
          const won = Number(t.w || t.won || 0)
          const drawn = Number(t.d || t.drawn || 0)
          const lost = Number(t.l || t.lost || 0)
          const goalsFor = Number(t.gf || t.goals_for || 0)
          const goalsAgainst = Number(t.ga || t.goals_against || 0)
          const goalDiff = Number(t.gd || t.goal_diff || goalsFor - goalsAgainst)
          const points = Number(t.pts || t.points || 0)

          upsert.run(teamName, fifaCode, groupName, played, won, drawn, lost, goalsFor, goalsAgainst, goalDiff, points)
          synced++
        }
      }
    }
  } catch {
    // API 失败，继续
  }

  return NextResponse.json({
    success: true,
    synced,
    timestamp: new Date().toISOString(),
  })
}
