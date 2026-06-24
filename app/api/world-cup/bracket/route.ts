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

  const groupTop2: Record<string, Array<{ team: string; flag: string }>> = {}
  for (const [groupName, teamMap] of Object.entries(groupTeams)) {
    type T = { team: string; flag: string; played: number; pts: number; gd: number; gf: number }
    const stats: Record<string, T> = {}
    for (const [name, flag] of teamMap.entries()) {
      stats[name] = { team: name, flag, played: 0, pts: 0, gd: 0, gf: 0 }
    }
    for (const m of rows) {
      if (m.group_name !== groupName) continue
      const home = m.home_team; const away = m.away_team
      const hs = m.home_score ?? 0; const as_ = m.away_score ?? 0
      if (!stats[home] || !stats[away]) continue
      stats[home].played++; stats[away].played++
      stats[home].gf += hs; stats[home].gd += hs - as_
      stats[away].gf += as_; stats[away].gd += as_ - hs
      if (hs > as_) { stats[home].pts += 3 }
      else if (hs < as_) { stats[away].pts += 3 }
      else { stats[home].pts += 1; stats[away].pts += 1 }
    }
    const sorted = Object.values(stats).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts
      if (b.gd !== a.gd) return b.gd - a.gd
      return b.gf - a.gf
    })
    groupTop2[groupName] = sorted.slice(0, 2).map(t => ({ team: t.team, flag: t.flag }))
  }

  const groupPairs: [string, string][] = [
    ['A', 'B'], ['C', 'D'], ['E', 'F'], ['G', 'H'], ['I', 'J'], ['K', 'L'],
  ]

  const buildMatch = (g1: string, pos1: number, g2: string, pos2: number) => {
    const t1 = groupTop2[g1]?.[pos1 - 1]
    const t2 = groupTop2[g2]?.[pos2 - 1]
    return {
      id: `${g1}${pos1}v${g2}${pos2}`,
      home: t1?.team ?? `${g1}${pos1}`,
      away: t2?.team ?? `${g2}${pos2}`,
      homeFlag: t1?.flag ?? '',
      awayFlag: t2?.flag ?? '',
      homeScore: null,
      awayScore: null,
      status: 'upcoming',
    }
  }

  const roundOf32: any[] = []
  for (const [g1, g2] of groupPairs) {
    roundOf32.push(buildMatch(g1, 1, g2, 2))
    roundOf32.push(buildMatch(g2, 1, g1, 2))
  }

  return NextResponse.json({
    roundOf32,
    roundOf16: [],
    quarters: [],
    semis: [],
    thirdPlace: null,
    final: null,
    champion: null,
  })
}
