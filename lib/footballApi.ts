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

// ── 内存缓存（teams & stadiums）──────────────────────────────

let teamsCache: Map<string, { id: string; name_en: string; fifa_code: string; flag: string }> | null = null
let teamsCacheTime = 0
let stadiumsCache: Map<string, { id: string; name_en: string; city_en: string; country_en: string; capacity: number }> | null = null
let stadiumsCacheTime = 0
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24小时

export interface WCTeamInfo {
  id: string
  name_en: string
  fifa_code: string
  flag: string
}

export interface WCStadiumInfo {
  id: string
  name_en: string
  city_en: string
  country_en: string
  capacity: number
}

export async function fetchAllTeams(): Promise<Map<string, WCTeamInfo>> {
  if (teamsCache && Date.now() - teamsCacheTime < CACHE_TTL) return teamsCache
  const resp = await fetch('https://worldcup26.ir/get/teams')
  const data = await resp.json()
  const teamsArr = (data as any).teams || data
  if (!Array.isArray(teamsArr)) {
    console.error('[footballApi] fetchAllTeams: unexpected response format', typeof data)
    return teamsCache ?? new Map()
  }
  teamsCache = new Map(
    teamsArr.map((t: any) => [
      t.id,
      { id: t.id, name_en: t.name_en, fifa_code: t.fifa_code || '', flag: t.flag || '' },
    ])
  )
  teamsCacheTime = Date.now()
  console.log(`[footballApi] Cached ${teamsCache.size} teams`)
  return teamsCache
}

export async function fetchAllStadiums(): Promise<Map<string, WCStadiumInfo>> {
  if (stadiumsCache && Date.now() - stadiumsCacheTime < CACHE_TTL) return stadiumsCache
  const resp = await fetch('https://worldcup26.ir/get/stadiums')
  const data = await resp.json()
  const stadiumsArr = (data as any).stadiums || data
  if (!Array.isArray(stadiumsArr)) {
    console.error('[footballApi] fetchAllStadiums: unexpected response format', typeof data)
    return stadiumsCache ?? new Map()
  }
  stadiumsCache = new Map(
    stadiumsArr.map((s: any) => [
      s.id,
      { id: s.id, name_en: s.name_en, city_en: s.city_en || '', country_en: s.country_en || '', capacity: s.capacity || 0 },
    ])
  )
  stadiumsCacheTime = Date.now()
  console.log(`[footballApi] Cached ${stadiumsCache.size} stadiums`)
  return stadiumsCache
}

// ── World Cup 2026 原始数据类型 ───────────────────────────────

/** 匹配 worldcup26.ir /get/games 返回的单场比赛 */
export interface WCMatchRaw {
  _id?: string
  id?: string
  home_team_id?: string
  away_team_id?: string
  home_team_name_en?: string
  home_team_name_fa?: string
  away_team_name_en?: string
  away_team_name_fa?: string
  home_score?: string
  away_score?: string
  home_scorers?: string   // JSON 字符串或 "null"
  away_scorers?: string   // JSON 字符串或 "null"
  group?: string
  matchday?: string
  local_date?: string     // "MM/DD/YYYY HH:mm"
  persian_date?: string
  stadium_id?: string
  finished?: string       // "TRUE" / "FALSE"
  time_elapsed?: string   // "finished" / "notstarted" / 分钟数字字符串
  type?: string
  // 兼容旧字段名（渐进式迁移）
  home_team?: string
  away_team?: string
  homeTeam?: string
  awayTeam?: string
  homeScore?: number | null
  awayScore?: number | null
  date?: string
  status?: string
  minute?: number | null
  stadium?: string
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
    const elapsed = String(m.time_elapsed || m.status || '')
    return elapsed !== 'finished' && elapsed !== 'notstarted'
  })
}
