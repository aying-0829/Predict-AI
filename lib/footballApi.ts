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

// ── fetch 工具 ──────────────────────────────────────────────

async function fetchJSON(url: string, timeoutMs = 5000): Promise<Record<string, unknown> | null> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: ctrl.signal })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
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
    played?: number
    won?: number
    drawn?: number
    lost?: number
    gf?: number
    ga?: number
    gd?: number
    points?: number
    // 兼容
    MP?: number
    W?: number
    D?: number
    L?: number
    GF?: number
    GA?: number
    GD?: number
    Pts?: number
  }[]
  standings?: any[]
}

export async function fetchWorldCupGames(): Promise<WCMatchRaw[] | null> {
  const json = await fetchJSON(`${WC_BASE}/games`)
  if (!json) return null
  // worldcup26 API 返回可能是数组或 { data: [...] }
  const arr = Array.isArray(json) ? json : json.data ?? json.games ?? json.matches ?? null
  return Array.isArray(arr) ? arr : null
}

export async function fetchWorldCupGroups(): Promise<WCGroupRaw[] | null> {
  const json = await fetchJSON(`${WC_BASE}/groups`)
  if (!json) return null
  const arr = Array.isArray(json) ? json : json.data ?? json.groups ?? json.standings ?? null
  return Array.isArray(arr) ? arr : null
}

// ── SportScore ──────────────────────────────────────────────

export interface SSMatchRaw {
  id?: string | number
  league?: { name?: string; id?: string | number }
  home_team?: { name?: string; code?: string }
  away_team?: { name?: string; code?: string }
  home_score?: number | null
  away_score?: number | null
  minute?: number | null
  status?: string
  start_time?: string
  date?: string
  // 兼容扁平结构
  league_name?: string
  home_team_name?: string
  away_team_name?: string
}

export async function fetchSportScoreLive(): Promise<SSMatchRaw[] | null> {
  const json = await fetchJSON(`${SS_BASE}/football/matches/live`)
  if (!json) return null
  const arr = Array.isArray(json) ? json : json.data ?? json.matches ?? null
  return Array.isArray(arr) ? arr : null
}

export async function fetchSportScoreMatches(params?: Record<string, string>): Promise<SSMatchRaw[] | null> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : ''
  const json = await fetchJSON(`${SS_BASE}/football/matches${qs}`)
  if (!json) return null
  const arr = Array.isArray(json) ? json : json.data ?? json.matches ?? null
  return Array.isArray(arr) ? arr : null
}

// ── 转换工具 ──────────────────────────────────────────────

/**
 * 带国旗 emoji 映射（常用参赛国）
 */
const FLAG_MAP: Record<string, string> = {
  brazil: '🇧🇷', morocco: '🇲🇦', france: '🇫🇷', england: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  argentina: '🇦🇷', germany: '🇩🇪', spain: '🇪🇸', portugal: '🇵🇹',
  italy: '🇮🇹', netherlands: '🇳🇱', belgium: '🇧🇪', croatia: '🇭🇷',
  uruguay: '🇺🇾', japan: '🇯🇵', 'south korea': '🇰🇷', korea: '🇰🇷',
  senegal: '🇸🇳', usa: '🇺🇸', 'united states': '🇺🇸', mexico: '🇲🇽',
  canada: '🇨🇦', australia: '🇦🇺', qatar: '🇶🇦', saudi: '🇸🇦',
  'saudi arabia': '🇸🇦', egypt: '🇪🇬', nigeria: '🇳🇬', ghana: '🇬🇭',
  ecuador: '🇪🇨', chile: '🇨🇱', colombia: '🇨🇴', peru: '🇵🇪',
  denmark: '🇩🇰', sweden: '🇸🇪', norway: '🇳🇴', switzerland: '🇨🇭',
  poland: '🇵🇱', austria: '🇦🇹', serbia: '🇷🇸', ukraine: '🇺🇦',
  'costa rica': '🇨🇷', iran: '🇮🇷', cameroon: '🇨🇲', tunisia: '🇹🇳',
  // 俱乐部
  'manchester city': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'man city': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', liverpool: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  arsenal: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', chelsea: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'real madrid': '🇪🇸',
  barcelona: '🇪🇸', 'atletico madrid': '🇪🇸', sevilla: '🇪🇸',
  'bayern munich': '🇩🇪', 'bayern': '🇩🇪', dortmund: '🇩🇪',
  'borussia dortmund': '🇩🇪', leipzig: '🇩🇪', 'rb leipzig': '🇩🇪',
  'bayer leverkusen': '🇩🇪', leverkusen: '🇩🇪',
  'ac milan': '🇮🇹', milan: '🇮🇹', juventus: '🇮🇹',
  'inter milan': '🇮🇹', 'inter': '🇮🇹', napoli: '🇮🇹',
}

function getFlag(name: string): string {
  const key = name.toLowerCase().trim()
  return FLAG_MAP[key] || '🏴'
}

/**
 * 映射状态字符串
 */
function mapStatus(s: string | undefined): 'live' | 'upcoming' | 'finished' {
  if (!s) return 'upcoming'
  const lower = s.toLowerCase()
  if (lower.includes('live') || lower.includes('ongoing') || lower.includes('in_play')) return 'live'
  if (lower.includes('finish') || lower.includes('ended') || lower.includes('completed') || lower.includes('ft')) return 'finished'
  if (lower.includes('schedul') || lower.includes('upcoming') || lower.includes('not_started')) return 'upcoming'
  // 有比分则 finished，有 minute 则 live
  return 'upcoming'
}

/**
 * 生成 AI 预测 mock 数据（基于真实对阵）
 */
function mockPrediction() {
  const winners = ['home', 'away', 'draw'] as const
  const w = winners[Math.floor(Math.random() * 3)]
  const h = Math.floor(Math.random() * 4)
  const a = Math.floor(Math.random() * 4)
  return {
    winner: w,
    confidence: Math.floor(Math.random() * 30) + 45,
    scorePrediction: `${h}-${a}`,
    bar: {
      home: w === 'home' ? Math.floor(Math.random() * 20) + 45 : Math.floor(Math.random() * 35) + 10,
      draw: w === 'draw' ? Math.floor(Math.random() * 20) + 40 : Math.floor(Math.random() * 30) + 10,
      away: w === 'away' ? Math.floor(Math.random() * 20) + 45 : Math.floor(Math.random() * 35) + 10,
    },
  }
}

/**
 * 将 WC/SS 原始数据转为 SportMatch 格式
 */

interface NormalizableMatch {
  home_team?: string | { name?: string }
  away_team?: string | { name?: string }
  home_team_name?: string
  away_team_name?: string
  homeTeam?: string
  awayTeam?: string
  home_score?: number | null
  away_score?: number | null
  homeScore?: number | null
  awayScore?: number | null
  status?: string
  league?: { name?: string; id?: string | number }
  league_name?: string
  group?: string
  start_time?: string
  date?: string
  minute?: number | null
}

export function normalizeMatch(raw: WCMatchRaw | SSMatchRaw, index: number): import('./services').SportMatch {
  const r = raw as NormalizableMatch
  // 球队名
  const home = r.home_team ?? r.homeTeam ?? r.home_team_name ?? 'Unknown'
  const away = r.away_team ?? r.awayTeam ?? r.away_team_name ?? 'Unknown'
  // 比分
  const hs = r.home_score ?? r.homeScore ?? null
  const as = r.away_score ?? r.awayScore ?? null
  // 状态
  const status = mapStatus(r.status ?? (hs !== null && hs !== undefined ? 'finished' : undefined))
  // 联赛
  let league = ''
  if (typeof r.league === 'object' && r.league?.name) league = r.league.name
  else if (r.league_name) league = r.league_name
  else league = r.group ?? (typeof r.league === 'string' ? r.league : undefined) ?? 'World Cup'
  // 时间
  const time = r.start_time ?? r.date ?? ''

  const id = `api-${index}`

  const match: import('./services').SportMatch = {
    id,
    league,
    homeTeam: (typeof home === 'object' && home?.name) ? home.name : String(home),
    awayTeam: (typeof away === 'object' && away?.name) ? away.name : String(away),
    homeFlag: getFlag(typeof home === 'object' && home?.name ? home.name : String(home)),
    awayFlag: getFlag(typeof away === 'object' && away?.name ? away.name : String(away)),
    time,
    status,
    aiPrediction: mockPrediction(),
  }

  if (status === 'live') {
    match.homeScore = hs ?? 0
    match.awayScore = as ?? 0
    match.minute = r.minute ?? undefined
  } else if (status === 'finished') {
    match.homeScore = hs ?? undefined
    match.awayScore = as ?? undefined
    match.actualResult = hs != null && as != null
      ? {
          homeScore: hs,
          awayScore: as,
          hit: match.aiPrediction.scorePrediction === `${hs}-${as}`,
        }
      : undefined
  }

  return match
}
