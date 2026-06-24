import { NextResponse } from 'next/server'
import { fetchWorldCupGroups } from '@/lib/footballApi'

// ── 球队名称映射 ──
const TEAM_NAME_CN: Record<string, string> = {
  'Mexico': '墨西哥', 'South Africa': '南非', 'South Korea': '韩国', 'Czech Republic': '捷克',
  'Canada': '加拿大', 'Bosnia and Herzegovina': '波黑', 'Qatar': '卡塔尔', 'Switzerland': '瑞士',
  'Brazil': '巴西', 'Morocco': '摩洛哥', 'Haiti': '海地', 'Scotland': '苏格兰',
  'United States': '美国', 'Paraguay': '巴拉圭', 'Australia': '澳大利亚', 'Turkey': '土耳其',
  'Germany': '德国', 'Ivory Coast': '科特迪瓦', 'Ecuador': '厄瓜多尔', 'Curaçao': '库拉索',
  'Netherlands': '荷兰', 'Japan': '日本', 'Sweden': '瑞典', 'Tunisia': '突尼斯',
  'Belgium': '比利时', 'Egypt': '埃及', 'Iran': '伊朗', 'New Zealand': '新西兰',
  'Spain': '西班牙', 'Cape Verde': '佛得角', 'Saudi Arabia': '沙特阿拉伯', 'Uruguay': '乌拉圭',
  'France': '法国', 'Senegal': '塞内加尔', 'Iraq': '伊拉克', 'Norway': '挪威',
  'Argentina': '阿根廷', 'Algeria': '阿尔及利亚', 'Austria': '奥地利', 'Jordan': '约旦',
  'Portugal': '葡萄牙', 'Democratic Republic of the Congo': '刚果(金)', 'Uzbekistan': '乌兹别克斯坦', 'Colombia': '哥伦比亚',
  'England': '英格兰', 'Croatia': '克罗地亚', 'Ghana': '加纳', 'Panama': '巴拿马',
}

// ── Fallback Standings ──
const FALLBACK_STANDINGS: Record<string, any[]> = {
  A: [
    { pos: 1, team: '墨西哥', flag: 'MX', played: 2, won: 2, drawn: 0, lost: 0, gf: '3', ga: '0', gd: '+3', pts: 6 },
    { pos: 2, team: '韩国', flag: 'KR', played: 2, won: 1, drawn: 0, lost: 1, gf: '2', ga: '2', gd: '0', pts: 3 },
    { pos: 3, team: '捷克', flag: 'CZ', played: 2, won: 0, drawn: 1, lost: 1, gf: '2', ga: '3', gd: '-1', pts: 1 },
    { pos: 4, team: '南非', flag: 'ZA', played: 2, won: 0, drawn: 1, lost: 1, gf: '1', ga: '3', gd: '-2', pts: 1 },
  ],
  B: [
    { pos: 1, team: '加拿大', flag: 'CA', played: 2, won: 1, drawn: 1, lost: 0, gf: '7', ga: '1', gd: '+6', pts: 4 },
    { pos: 2, team: '瑞士', flag: 'CH', played: 2, won: 1, drawn: 1, lost: 0, gf: '5', ga: '2', gd: '+3', pts: 4 },
    { pos: 3, team: '波黑', flag: 'BA', played: 2, won: 0, drawn: 1, lost: 1, gf: '2', ga: '5', gd: '-3', pts: 1 },
    { pos: 4, team: '卡塔尔', flag: 'QA', played: 2, won: 0, drawn: 1, lost: 1, gf: '1', ga: '7', gd: '-6', pts: 1 },
  ],
  C: [
    { pos: 1, team: '巴西', flag: 'BR', played: 2, won: 1, drawn: 1, lost: 0, gf: '4', ga: '1', gd: '+3', pts: 4 },
    { pos: 2, team: '摩洛哥', flag: 'MA', played: 2, won: 1, drawn: 1, lost: 0, gf: '2', ga: '1', gd: '+1', pts: 4 },
    { pos: 3, team: '苏格兰', flag: 'GB', played: 2, won: 1, drawn: 0, lost: 1, gf: '1', ga: '1', gd: '0', pts: 3 },
    { pos: 4, team: '海地', flag: 'HT', played: 2, won: 0, drawn: 0, lost: 2, gf: '0', ga: '4', gd: '-4', pts: 0 },
  ],
  D: [
    { pos: 1, team: '美国', flag: 'US', played: 2, won: 2, drawn: 0, lost: 0, gf: '6', ga: '1', gd: '+5', pts: 6 },
    { pos: 2, team: '澳大利亚', flag: 'AU', played: 2, won: 1, drawn: 0, lost: 1, gf: '2', ga: '2', gd: '0', pts: 3 },
    { pos: 3, team: '巴拉圭', flag: 'PY', played: 2, won: 1, drawn: 0, lost: 1, gf: '2', ga: '4', gd: '-2', pts: 3 },
    { pos: 4, team: '土耳其', flag: 'TR', played: 2, won: 0, drawn: 0, lost: 2, gf: '0', ga: '3', gd: '-3', pts: 0 },
  ],
  E: [
    { pos: 1, team: '德国', flag: 'DE', played: 2, won: 2, drawn: 0, lost: 0, gf: '9', ga: '2', gd: '+7', pts: 6 },
    { pos: 2, team: '科特迪瓦', flag: 'CI', played: 2, won: 1, drawn: 0, lost: 1, gf: '2', ga: '2', gd: '0', pts: 3 },
    { pos: 3, team: '厄瓜多尔', flag: 'EC', played: 2, won: 0, drawn: 1, lost: 1, gf: '0', ga: '1', gd: '-1', pts: 1 },
    { pos: 4, team: '库拉索', flag: 'CW', played: 2, won: 0, drawn: 1, lost: 1, gf: '1', ga: '7', gd: '-6', pts: 1 },
  ],
  F: [
    { pos: 1, team: '荷兰', flag: 'NL', played: 2, won: 1, drawn: 1, lost: 0, gf: '7', ga: '3', gd: '+4', pts: 4 },
    { pos: 2, team: '日本', flag: 'JP', played: 2, won: 1, drawn: 1, lost: 0, gf: '6', ga: '2', gd: '+4', pts: 4 },
    { pos: 3, team: '瑞典', flag: 'SE', played: 2, won: 1, drawn: 0, lost: 1, gf: '6', ga: '6', gd: '0', pts: 3 },
    { pos: 4, team: '突尼斯', flag: 'TN', played: 2, won: 0, drawn: 0, lost: 2, gf: '1', ga: '9', gd: '-8', pts: 0 },
  ],
  G: [
    { pos: 1, team: '新西兰', flag: 'NZ', played: 1, won: 0, drawn: 1, lost: 0, gf: '2', ga: '2', gd: '0', pts: 1 },
    { pos: 2, team: '伊朗', flag: 'IR', played: 1, won: 0, drawn: 1, lost: 0, gf: '2', ga: '2', gd: '0', pts: 1 },
    { pos: 3, team: '比利时', flag: 'BE', played: 1, won: 0, drawn: 1, lost: 0, gf: '1', ga: '1', gd: '0', pts: 1 },
    { pos: 4, team: '埃及', flag: 'EG', played: 1, won: 0, drawn: 1, lost: 0, gf: '1', ga: '1', gd: '0', pts: 1 },
  ],
  H: [
    { pos: 1, team: '西班牙', flag: 'ES', played: 1, won: 0, drawn: 1, lost: 0, gf: '0', ga: '0', gd: '0', pts: 1 },
    { pos: 2, team: '乌拉圭', flag: 'UY', played: 1, won: 0, drawn: 1, lost: 0, gf: '1', ga: '1', gd: '0', pts: 1 },
    { pos: 3, team: '佛得角', flag: 'CV', played: 1, won: 0, drawn: 1, lost: 0, gf: '0', ga: '0', gd: '0', pts: 1 },
    { pos: 4, team: '沙特阿拉伯', flag: 'SA', played: 1, won: 0, drawn: 1, lost: 0, gf: '1', ga: '1', gd: '0', pts: 1 },
  ],
  I: [
    { pos: 1, team: '挪威', flag: 'NO', played: 1, won: 1, drawn: 0, lost: 0, gf: '4', ga: '1', gd: '+3', pts: 3 },
    { pos: 2, team: '法国', flag: 'FR', played: 1, won: 1, drawn: 0, lost: 0, gf: '3', ga: '1', gd: '+2', pts: 3 },
    { pos: 3, team: '塞内加尔', flag: 'SN', played: 1, won: 0, drawn: 0, lost: 1, gf: '1', ga: '3', gd: '-2', pts: 0 },
    { pos: 4, team: '伊拉克', flag: 'IQ', played: 1, won: 0, drawn: 0, lost: 1, gf: '1', ga: '4', gd: '-3', pts: 0 },
  ],
  J: [
    { pos: 1, team: '阿根廷', flag: 'AR', played: 1, won: 1, drawn: 0, lost: 0, gf: '3', ga: '0', gd: '+3', pts: 3 },
    { pos: 2, team: '奥地利', flag: 'AT', played: 1, won: 1, drawn: 0, lost: 0, gf: '3', ga: '1', gd: '+2', pts: 3 },
    { pos: 3, team: '约旦', flag: 'JO', played: 1, won: 0, drawn: 0, lost: 1, gf: '1', ga: '3', gd: '-2', pts: 0 },
    { pos: 4, team: '阿尔及利亚', flag: 'DZ', played: 1, won: 0, drawn: 0, lost: 1, gf: '0', ga: '3', gd: '-3', pts: 0 },
  ],
  K: [
    { pos: 1, team: '哥伦比亚', flag: 'CO', played: 1, won: 1, drawn: 0, lost: 0, gf: '3', ga: '1', gd: '+2', pts: 3 },
    { pos: 2, team: '刚果(金)', flag: 'CD', played: 1, won: 0, drawn: 1, lost: 0, gf: '1', ga: '1', gd: '0', pts: 1 },
    { pos: 3, team: '葡萄牙', flag: 'PT', played: 1, won: 0, drawn: 1, lost: 0, gf: '1', ga: '1', gd: '0', pts: 1 },
    { pos: 4, team: '乌兹别克斯坦', flag: 'UZ', played: 1, won: 0, drawn: 0, lost: 1, gf: '1', ga: '3', gd: '-2', pts: 0 },
  ],
  L: [
    { pos: 1, team: '英格兰', flag: 'GB', played: 1, won: 1, drawn: 0, lost: 0, gf: '4', ga: '2', gd: '+2', pts: 3 },
    { pos: 2, team: '加纳', flag: 'GH', played: 1, won: 1, drawn: 0, lost: 0, gf: '1', ga: '0', gd: '+1', pts: 3 },
    { pos: 3, team: '巴拿马', flag: 'PA', played: 1, won: 0, drawn: 0, lost: 1, gf: '0', ga: '1', gd: '-1', pts: 0 },
    { pos: 4, team: '克罗地亚', flag: 'HR', played: 1, won: 0, drawn: 0, lost: 1, gf: '2', ga: '4', gd: '-2', pts: 0 },
  ],
}

interface KnockoutSlot {
  round: string
  home: string
  homeFlag: string
  away: string
  awayFlag: string
  isDecided: boolean
}

// 淘汰赛对阵编排
const R32_SLOTS = [
  [1, 3], [0, 2], [5, 7], [4, 6],
  [9, 11], [8, 10], [13, 15], [12, 14],
]
const R16_SLOTS = [
  [3, 15], [0, 4], [2, 6], [5, 14],
  [10, 12], [8, 13], [11, 7], [9, 1],
]
const QF_SLOTS = [
  [0, 2], [4, 5], [6, 8], [10, 12],
]
const SF_SLOTS = [
  [0, 4], [8, 10],
]
const FINAL_SLOTS = [
  [4, 8],
]

function buildBracket(standings: Record<string, any[]>): KnockoutSlot[][] {
  const groupKeys = ['A','B','C','D','E','F','G','H','I','J','K','L']
  const groupStandings = groupKeys.map(k => standings[k] || [])
  const top2 = groupStandings.flatMap((teams) => teams.slice(0, 2))

  const mkSlot = (idx1: number, idx2: number, round: string, decided: boolean): KnockoutSlot => ({
    round,
    home: top2[idx1]?.team || 'TBD',
    homeFlag: top2[idx1]?.flag || '',
    away: top2[idx2]?.team || 'TBD',
    awayFlag: top2[idx2]?.flag || '',
    isDecided: decided,
  })

  return [
    R32_SLOTS.map(([a, b]) => mkSlot(a, b, '1/16 决赛', true)),
    R16_SLOTS.map(([a, b]) => mkSlot(a, b, '1/8 决赛', true)),
    QF_SLOTS.map(([a, b]) => mkSlot(a, b, '1/4 决赛', false)),
    SF_SLOTS.map(([a, b]) => mkSlot(a, b, '半决赛', false)),
    FINAL_SLOTS.map(([a, b]) => ({ ...mkSlot(a, b, '决赛', false), homeFlag: '', awayFlag: '' })),
  ]
}

export async function GET() {
  try {
    const groupsRaw = await fetchWorldCupGroups()
    if (groupsRaw && groupsRaw.length > 0) {
      let teamMap: Record<string, string> = {}
      try {
        const resp = await fetch('https://worldcup26.ir/get/teams')
        const teamsData = await resp.json()
        const teams = Array.isArray(teamsData) ? teamsData : (teamsData.teams || teamsData.data || [])
        for (const t of teams) {
          teamMap[t.id] = TEAM_NAME_CN[t.name_en] || t.name_en
        }
      } catch { /* ignore */ }

      const groupStandings: any[][] = []
      const groupsSorted = [...groupsRaw].sort((a, b) => (a.name || '').localeCompare(b.name || ''))

      for (const g of groupsSorted) {
        const teams = (g.teams || g.standings || [])
          .map((t: any, i: number) => {
            const teamName = teamMap[t.team_id] || TEAM_NAME_CN[t.name] || t.team || `Team ${t.team_id}`
            return {
              pos: i + 1,
              team: teamName,
              flag: t.fifa_code || '',
              played: Number(t.mp || t.played || 0),
              won: Number(t.w || t.won || 0),
              drawn: Number(t.d || t.drawn || 0),
              lost: Number(t.l || t.lost || 0),
              gf: String(t.gf || 0),
              ga: String(t.ga || 0),
              gd: String(t.gd || 0),
              pts: Number(t.pts || t.points || 0),
            }
          })
          .sort((a, b) => b.pts - a.pts || parseInt(b.gd) - parseInt(a.gd) || parseInt(b.gf) - parseInt(a.gf))
        teams.forEach((t, i) => { t.pos = i + 1 })
        groupStandings.push(teams)
      }

      // Build standings record from API data
      const standingsRecord: Record<string, any[]> = {}
      groupsSorted.forEach((g, i) => {
        standingsRecord[g.name?.toUpperCase() || String.fromCharCode(65 + i)] = groupStandings[i]
      })

      const bracket = buildBracket(standingsRecord)
      return NextResponse.json(bracket)
    }
  } catch (e) {
    console.error('[world-cup/bracket] API error:', e)
  }

  // Fallback: build bracket from hardcoded standings
  try {
    const bracket = buildBracket(FALLBACK_STANDINGS)
    return NextResponse.json(bracket)
  } catch (e) {
    console.error('[world-cup/bracket] fallback error:', e)
    return NextResponse.json([], { status: 500 })
  }
}
