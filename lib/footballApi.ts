/**
 * 竞彩足球真实 API 数据源封装
 *
 * 数据源 1: World Cup 2026（免密钥）
 *   - GET https://worldcup26.ir/get/games    → 所有比赛（含比分/时间/状态）
 *   - GET https://worldcup26.ir/get/groups   → 12 组积分榜
 *   - GET https://worldcup26.ir/get/teams    → 48 支球队
 *   - GET https://worldcup26.ir/get/stadiums → 16 个球场
 *
 * 数据源 2: SportScore（免密钥，需 attribution）
 *   - GET https://sportscore.com/api/v1/football/matches/live
 *   - GET https://sportscore.com/api/v1/football/matches
 *   - 免费额度：~10000 请求/天/IP
 */

const WC_BASE = 'https://worldcup26.ir/get'
const SS_BASE = 'https://sportscore.com/api/v1'

// ── fetch 工具（增加超时 + 重试）─────────────────────────

async function fetchJSON(url: string, timeoutMs = 15000, retries = 1): Promise<Record<string, unknown> | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const res = await fetch(url, { signal: ctrl.signal })
      if (!res.ok) {
        if (attempt < retries) continue
        return null
      }
      return await res.json()
    } catch {
      if (attempt < retries) continue
      return null
    } finally {
      clearTimeout(timer)
    }
  }
  return null
}

// ── World Cup 2026 ──────────────────────────────────────────

export interface WCMatchRaw {
  _id?: string
  home_team?: string
  away_team?: string
  home_score?: number | null
  away_score?: number | null
  date?: string
  status?: string
  minute?: number | null
  group?: string
  stadium?: string
  // 兼容其他字段名
  homeTeam?: string
  awayTeam?: string
  homeScore?: number | null
  awayScore?: number | null
}

export interface WCGroupRaw {
  group?: string
  name?: string
  teams?: {
    name?: string
    team?: string
    team_id?: number
    fifa_code?: string
    mp?: number
    w?: number
    d?: number
    l?: number
    gf?: number
    ga?: number
    gd?: number
    pts?: number
    played?: number
    won?: number
    drawn?: number
    lost?: number
    points?: number
  }[]
  standings?: any[]
}

export async function fetchWorldCupGames(): Promise<WCMatchRaw[] | null> {
  const data = await fetchJSON(`${WC_BASE}/games`)
  if (!data) return null
  const games = Array.isArray(data) ? data : (data.games || data.matches || data.data || [])
  return Array.isArray(games) ? games : null
}

export async function fetchWorldCupGroups(): Promise<WCGroupRaw[] | null> {
  const data = await fetchJSON(`${WC_BASE}/groups`)
  if (!data) return null
  const groups = Array.isArray(data) ? data : (data.groups || data.data || [])
  return Array.isArray(groups) ? groups : null
}

export async function fetchLiveMatches(): Promise<WCMatchRaw[] | null> {
  const all = await fetchWorldCupGames()
  if (!all) return null
  return all.filter((m: any) => {
    const s = (m.status || '').toLowerCase()
    return s.includes('live') || s.includes('ongoing') || s.includes('in_play')
  })
}
