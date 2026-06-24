import { NextResponse } from 'next/server'
import { fetchWorldCupGroups } from '@/lib/footballApi'
import { getRealGroupStandings } from '@/lib/worldCupRealData'

// 球队名称映射（英文 → 中文），从 worldcup26.ir API english name 映射到 UI 中文
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

// FIFA 代码映射国旗
const FIFA_FLAG: Record<string, string> = {
  'RSA': 'ZA', 'KOR': 'KR', 'CZE': 'CZ', 'MEX': 'MX',
  'CAN': 'CA', 'BIH': 'BA', 'QAT': 'QA', 'SUI': 'CH',
  'BRA': 'BR', 'MAR': 'MA', 'HAI': 'HT', 'SCO': 'GB',
  'USA': 'US', 'PAR': 'PY', 'AUS': 'AU', 'TUR': 'TR',
  'GER': 'DE', 'CIV': 'CI', 'ECU': 'EC', 'CUW': 'CW',
  'NED': 'NL', 'JPN': 'JP', 'SWE': 'SE', 'TUN': 'TN',
  'BEL': 'BE', 'EGY': 'EG', 'IRN': 'IR', 'NZL': 'NZ',
  'ESP': 'ES', 'CPV': 'CV', 'KSA': 'SA', 'URU': 'UY',
  'FRA': 'FR', 'SEN': 'SN', 'IRQ': 'IQ', 'NOR': 'NO',
  'ARG': 'AR', 'ALG': 'DZ', 'AUT': 'AT', 'JOR': 'JO',
  'POR': 'PT', 'COD': 'CD', 'UZB': 'UZ', 'COL': 'CO',
  'ENG': 'GB', 'CRO': 'HR', 'GHA': 'GH', 'PAN': 'PA',
}

interface StandingEntry {
  pos: number
  team: string
  flag: string
  played: number
  won: number
  drawn: number
  lost: number
  gf: string
  ga: string
  gd: string
  pts: number
  status: string
}

interface KnockoutSlot {
  round: string
  home: string
  homeFlag: string
  away: string
  awayFlag: string
  isDecided: boolean
}

// 世界杯 48 队淘汰赛对阵编排（12 组前 2 名 × 8 场 1/16 决赛）
// 按 FIFA 官方对阵规则编排
const R32_SLOTS = [
  [1, 3],   // A2 vs B2
  [0, 2],   // A1 vs B1
  [5, 7],   // C2 vs D2
  [4, 6],   // C1 vs D1
  [9, 11],  // E2 vs F2
  [8, 10],  // E1 vs F1
  [13, 15], // G2 vs H2
  [12, 14], // G1 vs H1
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

export async function GET() {
  try {
    // 同时获取 teams API 以做名称映射
    const groupsRaw = await fetchWorldCupGroups()
    if (!groupsRaw || groupsRaw.length === 0) throw new Error('No groups data')

    // 获取 teams 数据
    let teamMap: Record<string, string> = {}
    try {
      const resp = await fetch('https://worldcup26.ir/get/teams')
      const teamsData = await resp.json()
      const teams = Array.isArray(teamsData) ? teamsData : (teamsData.teams || teamsData.data || [])
      for (const t of teams) {
        const name = TEAM_NAME_CN[t.name_en] || t.name_en
        teamMap[t.id] = name
      }
    } catch { /* fallback to TEAM_NAME_CN below */ }

    // 构建积分榜
    const groupStandings: StandingEntry[][] = []
    const groupsSorted = [...groupsRaw].sort((a, b) => (a.name || '').localeCompare(b.name || ''))

    for (const g of groupsSorted) {
      const teams: StandingEntry[] = (g.teams || g.standings || [])
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
            status: 'pending',
          }
        })
        .sort((a: StandingEntry, b: StandingEntry) => b.pts - a.pts || parseInt(b.gd) - parseInt(a.gd) || parseInt(b.gf) - parseInt(a.gf))

      // 重新标 pos
      teams.forEach((t, i) => { t.pos = i + 1 })
      groupStandings.push(teams)
    }

    // 取各组前 2 名
    const top2 = groupStandings.flatMap((teams) => teams.slice(0, 2))

    const mkSlot = (idx1: number, idx2: number, round: string, decided: boolean): KnockoutSlot => ({
      round,
      home: top2[idx1]?.team || 'TBD',
      homeFlag: top2[idx1]?.flag || '',
      away: top2[idx2]?.team || 'TBD',
      awayFlag: top2[idx2]?.flag || '',
      isDecided: decided,
    })

    const bracket: KnockoutSlot[][] = [
      R32_SLOTS.map(([a, b]) => mkSlot(a, b, '1/16 决赛', true)),
      R16_SLOTS.map(([a, b]) => mkSlot(a, b, '1/8 决赛', true)),
      QF_SLOTS.map(([a, b]) => mkSlot(a, b, '1/4 决赛', false)),
      SF_SLOTS.map(([a, b]) => mkSlot(a, b, '半决赛', false)),
      FINAL_SLOTS.map(([a, b]) => ({ ...mkSlot(a, b, '决赛', false), homeFlag: '', awayFlag: '' })),
    ]

    return NextResponse.json(bracket)
  } catch (error) {
    console.error('[world-cup/bracket]', error)
  }

  // 降级到静态数据
  try {
    const standings = getRealGroupStandings()
    const top2 = Object.entries(standings).flatMap(([group, teams]) => {
      const sorted = [...teams].sort((a, b) => a.pos - b.pos)
      return sorted.slice(0, 2).map(t => ({ group, ...t }))
    })

    const mkSlot = (idx1: number, idx2: number, round: string, decided: boolean): KnockoutSlot => ({
      round,
      home: top2[idx1]?.team || 'TBD',
      homeFlag: top2[idx1]?.flag || '',
      away: top2[idx2]?.team || 'TBD',
      awayFlag: top2[idx2]?.flag || '',
      isDecided: decided,
    })

    const bracket: KnockoutSlot[][] = [
      R32_SLOTS.map(([a, b]) => mkSlot(a, b, '1/16 决赛', true)),
      R16_SLOTS.map(([a, b]) => mkSlot(a, b, '1/8 决赛', true)),
      QF_SLOTS.map(([a, b]) => mkSlot(a, b, '1/4 决赛', false)),
      SF_SLOTS.map(([a, b]) => mkSlot(a, b, '半决赛', false)),
      FINAL_SLOTS.map(([a, b]) => ({ ...mkSlot(a, b, '决赛', false), homeFlag: '', awayFlag: '' })),
    ]
    return NextResponse.json(bracket)
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
