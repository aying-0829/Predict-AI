import { NextResponse } from 'next/server'
import { getGroupStandings } from '@/lib/services'
import { fetchWorldCupGroups, type WCGroupRaw } from '@/lib/footballApi'

function normalizeGroupStandings(groups: WCGroupRaw[]) {
  const result: Record<string, { team: string; played: number; won: number; drawn: number; lost: number; gf: number; ga: number; gd: number; points: number }[]> = {}

  for (const g of groups) {
    const groupName = g.group || g.name || 'Unknown'
    const teams = g.teams || g.standings || []

    result[groupName] = []
    for (const t of teams) {
      const name = (t as any).name || (t as any).team || 'Unknown'
      const played = (t as any).played ?? (t as any).MP ?? 0
      const won = (t as any).won ?? (t as any).W ?? 0
      const drawn = (t as any).drawn ?? (t as any).D ?? 0
      const lost = (t as any).lost ?? (t as any).L ?? 0
      const gf = (t as any).gf ?? (t as any).GF ?? 0
      const ga = (t as any).ga ?? (t as any).GA ?? 0
      const gd = (t as any).gd ?? (t as any).GD ?? gf - ga
      const points = (t as any).points ?? (t as any).Pts ?? 0

      result[groupName].push({
        team: name,
        played: Number(played),
        won: Number(won),
        drawn: Number(drawn),
        lost: Number(lost),
        gf: Number(gf),
        ga: Number(ga),
        gd: Number(gd),
        points: Number(points),
      })
    }
  }

  return result
}

export async function GET() {
  try {
    const wcGroups = await fetchWorldCupGroups()

    if (wcGroups && wcGroups.length > 0) {
      const standings = normalizeGroupStandings(wcGroups)

      return NextResponse.json({
        code: 0,
        data: standings,
        source: 'worldcup26.ir',
      })
    }
  } catch {
    // API 不可用，降级到 mock
  }

  // 兜底
  return NextResponse.json({ code: 0, data: getGroupStandings(), source: 'mock' })
}
