import { NextResponse } from 'next/server'
import { getWorldCupMatches } from '@/lib/services'
import { fetchWorldCupGames } from '@/lib/footballApi'
import type { WCMatchRaw } from '@/lib/footballApi'

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

function generateProbs(): { homeWin: number; draw: number; awayWin: number } {
  const home = Math.floor(Math.random() * 35) + 30
  const away = Math.floor(Math.random() * Math.max(10, 100 - home - 15))
  const draw = 100 - home - away
  return { homeWin: home, draw, awayWin: away }
}

function generateAiScore(): string {
  const homeGoals = Math.floor(Math.random() * 5)
  const awayGoals = Math.floor(Math.random() * 4)
  return `${homeGoals}:${awayGoals}`
}

function convertMatch(raw: WCMatchRaw, index: number) {
  const home = raw.home_team || raw.homeTeam || 'Unknown'
  const away = raw.away_team || raw.awayTeam || 'Unknown'
  const homeStr = typeof home === 'string' ? home : String(home)
  const awayStr = typeof away === 'string' ? away : String(away)
  const date = raw.date || ''

  let time = date
  if (date && date.includes('T')) {
    const d = new Date(date)
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const mins = String(d.getMinutes()).padStart(2, '0')
    time = `${month}-${day} ${hours}:${mins}`
  }

  const probs = generateProbs()

  return {
    id: raw._id || `wc-api-${index}`,
    time,
    league: '世界杯',
    group: raw.group || '',
    home: homeStr,
    homeFlag: getFlag(homeStr),
    away: awayStr,
    awayFlag: getFlag(awayStr),
    homeWin: probs.homeWin,
    draw: probs.draw,
    awayWin: probs.awayWin,
    aiScore: generateAiScore(),
  }
}

export async function GET() {
  try {
    const realGames = await fetchWorldCupGames()
    if (realGames && realGames.length > 0) {
      const matches = realGames.map((raw, i) => convertMatch(raw, i))
      return NextResponse.json(matches)
    }
  } catch {
    // fallback to mock
  }
  return NextResponse.json(getWorldCupMatches())
}
