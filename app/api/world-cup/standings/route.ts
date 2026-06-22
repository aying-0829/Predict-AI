import { NextResponse } from 'next/server'
import { getGroupStandings } from '@/lib/services'
import { fetchWorldCupGroups } from '@/lib/footballApi'
import type { WCGroupRaw } from '@/lib/footballApi'
import type { GroupStanding } from '@/lib/data'

function getFlag(name: string): string {
  const flags: Record<string, string> = {
    brazil: 'BR', morocco: 'MA', germany: 'DE', netherlands: 'NL',
    japan: 'JP', sweden: 'SE', switzerland: 'CH', australia: 'AU',
    usa: 'US', spain: 'ES', england: 'GB-ENG', france: 'FR',
    argentina: 'AR', portugal: 'PT', italy: 'IT', belgium: 'BE',
    croatia: 'HR', uruguay: 'UY', ecuador: 'EC', denmark: 'DK',
    poland: 'PL', serbia: 'RS', senegal: 'SN', iran: 'IR',
    'south korea': 'KR', korea: 'KR', mexico: 'MX', canada: 'CA',
    qatar: 'QA', saudi: 'SA', 'saudi arabia': 'SA', egypt: 'EG',
    nigeria: 'NG', ghana: 'GH', tunisia: 'TN', cameroon: 'CM',
    'costa rica': 'CR', colombia: 'CO', peru: 'PE', chile: 'CL',
    norway: 'NO', austria: 'AT', ukraine: 'UA', turkey: 'TR',
    wales: 'GB-WLS', scotland: 'GB-SCT', 'côte d\'ivoire': 'CI',
    'ivory coast': 'CI', haiti: 'HT',
  }
  const key = name.toLowerCase().trim()
  return flags[key] || name.slice(0, 2).toUpperCase()
}

function convertStanding(
  team: Record<string, unknown>,
  pos: number
): GroupStanding {
  const played = (team.played ?? team.MP ?? 0) as number
  const won = (team.won ?? team.W ?? 0) as number
  const drawn = (team.drawn ?? team.D ?? 0) as number
  const lost = (team.lost ?? team.L ?? 0) as number
  const gf = (team.gf ?? team.GF ?? 0) as number
  const ga = (team.ga ?? team.GA ?? 0) as number
  const pts = (team.points ?? team.Pts ?? 0) as number
  const name = (team.name || team.team || 'Unknown') as string

  let status: 'qualify' | 'playoff' | 'elim'
  if (pos <= 2) status = 'qualify'
  else if (pos === 3) status = 'playoff'
  else status = 'elim'

  return { pos, team: name, flag: getFlag(name), played, won, drawn, lost, gf, ga, pts, status }
}

export async function GET() {
  try {
    const realGroups = await fetchWorldCupGroups()
    if (realGroups && realGroups.length > 0) {
      const standings: Record<string, GroupStanding[]> = {}
      realGroups.forEach((group: WCGroupRaw, gi: number) => {
        const groupName = group.name || group.group || `${String.fromCharCode(65 + gi)}组`
        const raw = (group.teams || group.standings || []) as Record<string, unknown>[]
        const sorted = [...raw].sort((a, b) => {
          const ptsA = (a.points ?? a.Pts ?? 0) as number
          const ptsB = (b.points ?? b.Pts ?? 0) as number
          return ptsB - ptsA
        })
        standings[groupName] = sorted.map((t, i) => convertStanding(t, i + 1))
      })
      return NextResponse.json(standings)
    }
  } catch {
    // fallback to mock
  }
  return NextResponse.json(getGroupStandings())
}
