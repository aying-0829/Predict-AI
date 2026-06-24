import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const db = getDB()

  const rows = db.prepare(
    "SELECT * FROM matches WHERE status = 'finished' OR status = 'live' ORDER BY group_name, match_date, match_time"
  ).all() as any[]

  const groupTeams: Record<string, Map<string, string>> = {}
  for (const m of rows) {
    if (!m.group_name) continue
    if (!groupTeams[m.group_name]) groupTeams[m.group_name] = new Map()
    groupTeams[m.group_name].set(m.home_team, m.home_flag || '')
    groupTeams[m.group_name].set(m.away_team, m.away_flag || '')
  }

  const result: Array<{ group: string; teams: Array<Record<string, any>> }> = []

  for (const [groupName, teamMap] of Object.entries(groupTeams)) {
    type TeamRecord = { team: string; flag: string; played: number; won: number; drawn: number; lost: number; gf: number; ga: number; gd: number; pts: number }
    const stats: Record<string, TeamRecord> = {}

    for (const [name, flag] of teamMap.entries()) {
      stats[name] = { team: name, flag, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 }
    }

    for (const m of rows) {
      if (m.group_name !== groupName) continue
      const home = m.home_team
      const away = m.away_team
      const hs = m.home_score ?? 0
      const as = m.away_score ?? 0
      if (!stats[home] || !stats[away]) continue

      stats[home].played++; stats[away].played++
      stats[home].gf += hs; stats[home].ga += as
      stats[away].gf += as; stats[away].ga += hs

      if (hs > as) { stats[home].won++; stats[home].pts += 3; stats[away].lost++ }
      else if (hs < as) { stats[away].won++; stats[away].pts += 3; stats[home].lost++ }
      else { stats[home].drawn++; stats[away].drawn++; stats[home].pts += 1; stats[away].pts += 1 }
    }

    for (const s of Object.values(stats)) { s.gd = s.gf - s.ga }

    const sorted = Object.values(stats).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts
      if (b.gd !== a.gd) return b.gd - a.gd
      return b.gf - a.gf
    })

    const teams = sorted.map((t, i) => ({
      pos: i + 1,
      team: t.team,
      flag: t.flag,
      played: t.played,
      won: t.won,
      drawn: t.drawn,
      lost: t.lost,
      gf: String(t.gf),
      ga: String(t.ga),
      gd: (t.gd >= 0 ? '+' : '') + t.gd,
      pts: t.pts,
      status: i === 0 ? 'qualify' : i === 3 ? 'elim' : 'pending',
    }))

    result.push({ group: groupName, teams })
  }

  result.sort((a, b) => a.group.localeCompare(b.group))

  return NextResponse.json(result)
}
