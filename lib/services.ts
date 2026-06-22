/* ===== Predict AI Mock Service Layer =====
 * 提供 22 个降级函数，25 个 API 路由在真实 API 失败时以此兜底。
 * 数据来源：lib/data.ts（worldCupMatches, lotteryData, accuracyStats 等）
 * 以及 lib/db.ts 种子数据的镜像 mock。
 */

import {
  worldCupMatches,
  lotteryData,
  accuracyStats,
  groupStandings,
  groupNames,
  knockoutBracket,
  topScorers,
  tournamentStats,
  matchDates,
  danmakuPool,
  type Match,
  type LotteryDraw,
  type KnockoutSlot,
  type GroupStanding,
  type Scorer,
} from './data'

// 类型别名：lottery 页面使用 LotteryDrawData 引用 LotteryDraw
export type LotteryDrawData = LotteryDraw

// 重新导出 data.ts 中 world-cup 页面直接引用的类型
export type { GroupStanding, KnockoutSlot, Scorer }

// 已有页面引用 SportMatch，兼容 odds/calendar route 以及 MatchCard 组件
export interface SportMatch {
  id: string
  time: string
  league: string
  homeTeam: string
  awayTeam: string
  homeFlag: string
  awayFlag: string
  status: 'live' | 'upcoming' | 'finished'
  homeScore?: number
  awayScore?: number
  minute?: number
  actualResult?: { homeScore: number; awayScore: number; hit: boolean }
  aiPrediction: {
    winner: 'home' | 'draw' | 'away'
    confidence: number
    scorePrediction: string
    bar: { home: number; draw: number; away: number }
  }
}

/* ============ 通用类型 ============ */
export type LotteryType = 'ssq' | 'dlt' | '3d'

export interface LotteryTypeInfo {
  id: LotteryType
  name: string
}

export interface LotteryHistoryItem {
  id: string
  type: string
  period: string
  date: string
  numbers: string
  result: string
  aiRecommend: string
  hit: number
  isHit: boolean
  /** 解析后红球号码列表（3D 为各 digit） */
  reds: number[]
  /** 解析后的蓝球号码（3D 为 -1） */
  blue: number
  /** 和值 */
  sum: number
  /** 奇偶比例字符串，如 "3:3" */
  oddEven: string
  /** 区间分布描述 */
  zone: string
}

export interface HotColdItem {
  number: number
  type?: string
  frequency?: number
  status?: 'hot' | 'warm' | 'cold'
  probability: number
  lastAppearance?: number
  maxMiss?: number
  alert?: string
}

export interface MissStat {
  number: number
  type: 'red' | 'blue'
  lastAppearance: string
  missCount: number
  maxMiss: number
  avgMiss: number
  alert: 'hot' | 'warn' | 'alert' | 'normal'
}

export interface AIRecommendation {
  period?: string
  date?: string
  reds: number[]
  blues: number[]
  numberProbabilities: { number: number; probability: number }[]
  confidence: number
  analysis: string
}

export interface MatchStats {
  possession: [number, number]
  shots: [number, number]
  shotsOnTarget: [number, number]
  corners: [number, number]
  fouls: [number, number]
  yellowCards: [number, number]
}

export interface AIPredictionItem {
  type: string
  period: string
  redBalls: number[]
  blueBalls: number[]
  confidence: number
  reasoning: string
}

export interface AIAnalysisResult {
  summary: string
  keyFactors: string[]
  confidence: number
  recommendation: string
}

export interface HandicapItem {
  matchId: string
  homeTeam: string
  awayTeam: string
  homeOdds: number
  drawOdds: number
  awayOdds: number
  handicap: string
  handicapHome: number
  handicapAway: number
}

export interface KpiStats {
  totalPredictions: number
  accuracy: number
  accuracyChange: number
  checkinDays: number
  points: number
  weeklyPredictions: number
}

export interface PredictionRecord {
  id: number
  type: string
  period: string
  date: string
  numbers: string
  result: string
  aiNumbers: string
  hit: number
  isHit: boolean
}

export interface RecentTrendItem {
  date: string
  accuracy: number
  predictions: number
}

export interface TodayRecommendation {
  id: string
  type: 'match' | 'lottery'
  title: string
  subtitle: string
  confidence: number
  detail?: string
}

export interface MemberPlan {
  id: string
  name: string
  price: number
  originalPrice?: number
  features: string[]
  recommended: boolean
}

export interface MemberFeature {
  feature: string
  free: string | boolean
  premium: string | boolean
  pro: string | boolean
}

export interface PointsRule {
  action: string
  points: number
  description: string
  limit?: string
}

/* ============ DB 种子数据镜像（供 mock 函数使用） ============ */
const predictionsSeed: PredictionRecord[] = [
  { id: 1, type: 'ssq', period: '2026069', date: '2026-06-25 10:00:00', numbers: '02,07,14,21,26,33|05', result: '02,07,14,21,26,33|05', aiNumbers: '04,09,15,22,28,31|06,12', hit: 2, isHit: false },
  { id: 2, type: 'dlt', period: '2026069', date: '2026-06-25 10:00:00', numbers: '03,10,18,24,31|02,09', result: '03,10,18,24,31|02,09', aiNumbers: '05,12,19,26,33|04,11', hit: 0, isHit: false },
  { id: 3, type: '3d', period: '2026172', date: '2026-06-25 10:00:00', numbers: '6,3,9', result: '6,3,9', aiNumbers: '4,7,2', hit: 0, isHit: false },
  { id: 4, type: 'ssq', period: '2026068', date: '2026-06-21 10:00:00', numbers: '05,12,17,23,29,32|11', result: '05,12,17,23,29,32|11', aiNumbers: '03,08,16,21,27,30|04,14', hit: 2, isHit: false },
  { id: 5, type: 'dlt', period: '2026068', date: '2026-06-21 10:00:00', numbers: '07,14,21,27,34|05,10', result: '07,14,21,27,34|05,10', aiNumbers: '02,09,17,23,30|03,08', hit: 0, isHit: false },
  { id: 6, type: 'ssq', period: '2026067', date: '2026-06-18 10:00:00', numbers: '04,11,16,22,27,31|09', result: '04,11,16,22,27,31|09', aiNumbers: '06,13,18,24,29,33|03,15', hit: 2, isHit: false },
  { id: 7, type: 'dlt', period: '2026067', date: '2026-06-18 10:00:00', numbers: '01,08,15,22,29|07,12', result: '01,08,15,22,29|07,12', aiNumbers: '04,11,18,25,32|02,09', hit: 0, isHit: false },
  { id: 8, type: 'ssq', period: '2026066', date: '2026-06-14 10:00:00', numbers: '01,07,13,20,25,30|03', result: '01,07,13,20,25,30|03', aiNumbers: '02,09,15,21,27,32|05,11', hit: 2, isHit: false },
  { id: 9, type: 'dlt', period: '2026066', date: '2026-06-14 10:00:00', numbers: '06,12,19,25,33|04,08', result: '06,12,19,25,33|04,08', aiNumbers: '03,10,17,23,30|06,10', hit: 1, isHit: false },
  { id: 10, type: 'ssq', period: '2026065', date: '2026-06-11 10:00:00', numbers: '03,08,15,22,28,31|07', result: '03,08,15,22,28,31|07', aiNumbers: '05,11,18,23,27,33|09,12', hit: 1, isHit: false },
  { id: 11, type: 'dlt', period: '2026065', date: '2026-06-11 10:00:00', numbers: '05,11,17,23,29|03,08', result: '05,11,17,23,29|03,08', aiNumbers: '04,10,16,24,31|06,10', hit: 0, isHit: false },
  { id: 12, type: 'ssq', period: '2026064', date: '2026-06-09 10:00:00', numbers: '01,06,12,19,24,30|14', result: '01,06,12,19,24,30|14', aiNumbers: '02,09,14,21,26,32|05,11', hit: 2, isHit: false },
  { id: 13, type: '3d', period: '2026162', date: '2026-06-09 10:00:00', numbers: '8,5,2', result: '8,5,2', aiNumbers: '9,4,7', hit: 0, isHit: false },
  { id: 14, type: 'dlt', period: '2026064', date: '2026-06-07 10:00:00', numbers: '09,13,20,27,34|03,11', result: '09,13,20,27,34|03,11', aiNumbers: '07,12,18,25,31|05,10', hit: 1, isHit: false },
  { id: 15, type: 'ssq', period: '2026063', date: '2026-06-05 10:00:00', numbers: '08,14,18,23,29,32|02', result: '08,14,18,23,29,32|02', aiNumbers: '03,10,17,22,28,33|07,12', hit: 3, isHit: false },
  { id: 16, type: 'dlt', period: '2026063', date: '2026-06-04 10:00:00', numbers: '04,10,16,21,28|01,09', result: '04,10,16,21,28|01,09', aiNumbers: '06,12,19,24,30|03,07', hit: 0, isHit: false },
  { id: 17, type: 'ssq', period: '2026062', date: '2026-06-02 10:00:00', numbers: '02,07,13,19,25,30|06', result: '02,07,13,19,25,30|06', aiNumbers: '05,11,17,23,28,32|08,14', hit: 1, isHit: false },
  { id: 18, type: '3d', period: '2026155', date: '2026-06-01 10:00:00', numbers: '4,7,1', result: '4,7,1', aiNumbers: '5,3,8', hit: 0, isHit: false },
  { id: 19, type: 'ssq', period: '2026061', date: '2026-05-31 10:00:00', numbers: '09,12,17,22,27,33|04', result: '09,12,17,22,27,33|04', aiNumbers: '03,08,15,21,26,31|07,12', hit: 1, isHit: false },
  { id: 20, type: 'dlt', period: '2026062', date: '2026-05-30 10:00:00', numbers: '06,11,18,24,30|05,10', result: '06,11,18,24,30|05,10', aiNumbers: '03,09,15,22,28|04,09', hit: 1, isHit: false },
]

/* ============ 1. getLotteryData ============ */
export function getLotteryData(): LotteryDraw[] {
  return lotteryData
}

/* ============ 2. getLotteryHistory ============ */
/** 根据 numbers 字符串解析 lottery 衍生字段 */
function computeLotteryFields(numbers: string, type: string): { reds: number[]; blue: number; sum: number; oddEven: string; zone: string } {
  const parts = numbers.replace(/[|｜]/g, '|').split('|')
  const redStrs = parts[0].split(',').map((s) => s.trim()).filter(Boolean)
  const blueStrs = parts[1] ? parts[1].split(',').map((s) => s.trim()).filter(Boolean) : []
  const reds = redStrs.map(Number)
  const blues = blueStrs.map(Number)
  const allNums = [...reds, ...blues]

  // 蓝球（3D 没有蓝球）
  const blue = type === '3d' ? -1 : (blues[0] || 0)

  // 和值（3D 直接返回所有号码之和，SSQ/DLT 返回红球之和）
  const sum = allNums.reduce((s, n) => s + n, 0)

  // 奇偶比例
  const oddCount = reds.filter((n) => n % 2 === 1).length
  const evenCount = reds.length - oddCount
  const oddEven = `${oddCount}:${evenCount}`

  // 区间分布（SSQ: 1-11 / 12-22 / 23-33；DLT: 1-12 / 13-24 / 25-35；3D: 0-3 / 4-6 / 7-9）
  let z1 = 0, z2 = 0, z3 = 0
  if (type === 'ssq') {
    reds.forEach((n) => { if (n <= 11) z1++; else if (n <= 22) z2++; else z3++ })
  } else if (type === 'dlt') {
    reds.forEach((n) => { if (n <= 12) z1++; else if (n <= 24) z2++; else z3++ })
  } else {
    allNums.forEach((n) => { if (n <= 3) z1++; else if (n <= 6) z2++; else z3++ })
  }
  const zone = `${z1}:${z2}:${z3}`

  return { reds, blue, sum, oddEven, zone }
}

export function getLotteryHistory(type: string, limit: number = 10): LotteryHistoryItem[] {
  const mapped = predictionsSeed
    .filter((p) => !type || type === 'all' || p.type === type)
    .slice(0, limit)
    .map((p) => {
      const fields = computeLotteryFields(p.numbers, p.type)
      return {
        id: String(p.id),
        type: p.type,
        period: p.period,
        date: p.date,
        numbers: p.numbers,
        result: p.result,
        aiRecommend: p.aiNumbers,
        hit: p.hit,
        isHit: p.isHit,
        ...fields,
      }
    })

  // 若无 DB 种子匹配，则从 lotteryData 生成兜底
  if (mapped.length === 0 && type) {
    const lotteries = lotteryData.filter((l) => {
      if (type === 'ssq') return l.name === '双色球'
      if (type === 'dlt') return l.name === '大乐透'
      return false
    })
    return lotteries.slice(0, limit).map((l, i) => {
      const numbers = [...l.redBalls, ...l.blueBalls].join(',')
      return {
        id: `${type}-mock-${i}`,
        type,
        period: l.period,
        date: l.date,
        numbers,
        result: '',
        aiRecommend: [...l.aiRecommend.red, ...l.aiRecommend.blue].join(','),
        hit: 0,
        isHit: false,
        ...computeLotteryFields(numbers, type),
      }
    })
  }

  return mapped
}

/* ============ 3. getLotteryTypes ============ */
export function getLotteryTypes(): LotteryTypeInfo[] {
  return [
    { id: 'ssq', name: '双色球' },
    { id: 'dlt', name: '大乐透' },
    { id: '3d', name: '福彩3D' },
  ]
}

/* ============ 4. getHotColdAnalysis ============ */
export function getHotColdAnalysis(type: string): { hot: HotColdItem[]; cold: HotColdItem[]; missed: HotColdItem[] } {
  const datasets: Record<string, { hot: number[]; cold: number[]; warm: number[] }> = {
    ssq: {
      hot: [5, 11, 18, 23, 27, 33],
      cold: [2, 7, 13, 20, 29, 30],
      warm: [1, 3, 4, 6, 8, 9, 10, 12, 14, 15, 16, 17, 19, 21, 22, 24, 25, 26, 28, 31, 32],
    },
    dlt: {
      hot: [7, 13, 22, 25, 31],
      cold: [1, 4, 16, 30, 35],
      warm: [2, 3, 5, 6, 8, 9, 10, 11, 12, 14, 15, 17, 18, 19, 20, 21, 23, 24, 26, 27, 28, 29, 32, 33, 34],
    },
    '3d': {
      hot: [0, 3, 5, 8],
      cold: [1, 4, 7],
      warm: [2, 6, 9],
    },
    pl5: {
      hot: [0, 3, 6, 8, 9],
      cold: [1, 2, 4, 5, 7],
      warm: [],
    },
    sport: {
      hot: [],
      cold: [],
      warm: [],
    },
  }

  const ds = datasets[type] || datasets['ssq']

  const hot: HotColdItem[] = ds.hot.map((n, i) => ({
    number: n,
    type: 'red',
    frequency: 85 - i * 5 + Math.floor(Math.random() * 3),
    probability: 60 + Math.floor(Math.random() * 35),
  }))

  const cold: HotColdItem[] = ds.cold.map((n, i) => ({
    number: n,
    type: 'red',
    probability: 12 + i * 5 + Math.floor(Math.random() * 15),
    lastAppearance: 12 + i * 3 + Math.floor(Math.random() * 5),
  }))

  const missed: HotColdItem[] = ds.cold.slice(0, 4).map((n, i) => ({
    number: n,
    type: 'red',
    probability: 5 + Math.floor(Math.random() * 10),
    maxMiss: 25 + i * 3 + Math.floor(Math.random() * 8),
    alert: i === 0 ? 'high' : 'warn',
  }))

  return { hot, cold, missed }
}

/* ============ 5. getMissStats ============ */
export function getMissStats(type: string): MissStat[] {
  const maxNum = type === 'ssq' ? 33 : type === 'dlt' ? 35 : type === '3d' ? 9 : 33
  const stats: MissStat[] = []

  const redSeed = [5, 3, 11, 7, 22, 2, 15, 31, 0, 4, 1, 19, 13, 9, 28, 6, 0, 17, 25, 3]
  const _blueSeed = [8, 1, 14, 6, 0, 4, 9, 2, 12, 7, 1, 15, 3, 10, 5, 2]

  for (let i = 1; i <= Math.min(maxNum, 20); i++) {
    const missCount = i <= 4 ? 0 : redSeed[i % redSeed.length] + Math.floor(Math.random() * 6)
    const maxMiss = Math.floor(Math.random() * 28) + 8
    const avgMiss = +(3 + Math.random() * 6).toFixed(1)
    const alert: MissStat['alert'] = missCount === 0 ? 'hot'
      : missCount > maxMiss * 0.85 ? 'alert'
      : missCount > maxMiss * 0.6 ? 'warn'
      : 'normal'

    stats.push({
      number: i,
      type: 'red',
      lastAppearance: missCount === 0 ? `20260${65 - i}` : `${missCount}期前`,
      missCount,
      maxMiss,
      avgMiss,
      alert,
    })
  }

  return stats
}

/* ============ 6. getAIPredictions ============ */
/** 基于种子生成伪随机但不重复的选号（无放回抽样） */
function seededPick(pool: number[], count: number, seed: number): number[] {
  const arr = [...pool]
  const result: number[] = []
  let s = seed
  for (let i = 0; i < count; i++) {
    s = (s * 16807 + 0) % 2147483647
    const idx = s % arr.length
    result.push(arr[idx])
    arr.splice(idx, 1)
  }
  return result.sort((a, b) => a - b)
}

export function getAIPredictions(type: string, seed?: number): { current: AIRecommendation; next: AIRecommendation } {
  const rng = seed ?? Math.floor(Math.random() * 2147483647)

  const configs: Record<string, { redMax: number; blueMax: number; redCount: number; blueCount: number }> = {
    ssq: { redMax: 33, blueMax: 16, redCount: 6, blueCount: 1 },
    dlt: { redMax: 35, blueMax: 12, redCount: 5, blueCount: 2 },
    '3d': { redMax: 9, blueMax: 0, redCount: 3, blueCount: 0 },
  }

  const cfg = configs[type] || configs['ssq']
  const redPool = Array.from({ length: cfg.redMax }, (_, i) => i + 1)
  const bluePool = Array.from({ length: cfg.blueMax }, (_, i) => i + 1)

  const analyses: Record<string, string> = {
    ssq: '基于近 100 期热号追踪 + 遗漏回补模型，红球重点关注中后区号码，蓝球倾向于小号区间反弹。',
    dlt: '前区号码呈现 1-2-1 区间分布趋势，后区重点关注 05-10 区间遗漏回补信号。',
    '3d': '百位连续 3 期走小，预计向中区回归；十位关注偶数反弹；个位振幅看大。',
  }

  const makeRec = (s: number): AIRecommendation => {
    const reds = seededPick(redPool, cfg.redCount, s)
    const blues = cfg.blueCount > 0 ? seededPick(bluePool, cfg.blueCount, s + 777) : []
    return {
      reds,
      blues,
      numberProbabilities: [
        ...reds.map((n) => ({ number: n, probability: Math.round(60 + Math.random() * 30) })),
        ...blues.map((n) => ({ number: n, probability: Math.round(55 + Math.random() * 30) })),
      ],
      confidence: type === 'ssq' ? 72 : type === 'dlt' ? 68 : 65,
      analysis: analyses[type] || analyses['ssq'],
    }
  }

  return { current: makeRec(rng), next: makeRec(rng + 1) }
}

/* ============ 7. getSportMatches ============ */
export function getSportMatches(filter?: string): SportMatch[] {
  const today = '06-18'

  // 给 Match 补上 SportMatch 扩展字段
  const enrich = (m: Match, status: SportMatch['status'] = 'upcoming'): SportMatch => {
    const winner = parseScoreToWinner(m.aiScore || '')
    const baseHome = 40 + Math.floor(Math.random() * 20)
    const baseDraw = 20 + Math.floor(Math.random() * 15)
    return {
      id: m.id,
      time: m.time,
      league: m.league,
      homeTeam: m.home,
      awayTeam: m.away,
      homeFlag: m.homeFlag,
      awayFlag: m.awayFlag,
      status,
      aiPrediction: {
        winner,
        confidence: 60 + Math.floor(Math.random() * 25),
        scorePrediction: m.aiScore || '1:1',
        bar: { home: baseHome, draw: baseDraw, away: 100 - baseHome - baseDraw },
      },
    }
  }

  // 五大联赛模拟数据
  const leagueMatches: SportMatch[] = [
    { id: 'pl001', time: '06-18 02:30', league: '英超', homeTeam: '阿森纳', homeFlag: 'GB-ENG', awayTeam: '利物浦', awayFlag: 'GB-ENG', status: 'upcoming', aiPrediction: { winner: 'home', confidence: 68, scorePrediction: '2:1', bar: { home: 48, draw: 28, away: 24 } } },
    { id: 'pl002', time: '06-18 04:00', league: '西甲', homeTeam: '巴塞罗那', homeFlag: 'ES', awayTeam: '马德里竞技', awayFlag: 'ES', status: 'upcoming', aiPrediction: { winner: 'draw', confidence: 55, scorePrediction: '1:1', bar: { home: 35, draw: 35, away: 30 } } },
    { id: 'pl003', time: '06-19 02:30', league: '英超', homeTeam: '曼城', homeFlag: 'GB-ENG', awayTeam: '切尔西', awayFlag: 'GB-ENG', status: 'upcoming', aiPrediction: { winner: 'home', confidence: 82, scorePrediction: '3:0', bar: { home: 65, draw: 20, away: 15 } } },
    { id: 'pl004', time: '06-18 02:30', league: '意甲', homeTeam: '国际米兰', homeFlag: 'IT', awayTeam: '尤文图斯', awayFlag: 'IT', status: 'upcoming', aiPrediction: { winner: 'home', confidence: 62, scorePrediction: '1:0', bar: { home: 42, draw: 33, away: 25 } } },
    { id: 'pl005', time: '06-19 04:00', league: '德甲', homeTeam: '拜仁慕尼黑', homeFlag: 'DE', awayTeam: '多特蒙德', awayFlag: 'DE', status: 'upcoming', aiPrediction: { winner: 'home', confidence: 71, scorePrediction: '2:1', bar: { home: 50, draw: 28, away: 22 } } },
    { id: 'pl006', time: '06-20 02:30', league: '法甲', homeTeam: '巴黎圣日耳曼', homeFlag: 'FR', awayTeam: '里昂', awayFlag: 'FR', status: 'upcoming', aiPrediction: { winner: 'home', confidence: 85, scorePrediction: '3:1', bar: { home: 62, draw: 22, away: 16 } } },
  ]

  // 已结束的模拟比赛
  const finishedMatches: SportMatch[] = [
    { id: 'fin001', time: '06-13 02:30', league: '英超', homeTeam: '曼联', homeFlag: 'GB-ENG', awayTeam: '热刺', awayFlag: 'GB-ENG', status: 'finished', homeScore: 1, awayScore: 0, aiPrediction: { winner: 'home', confidence: 65, scorePrediction: '1:0', bar: { home: 42, draw: 30, away: 28 } } },
    { id: 'fin002', time: '06-12 04:00', league: '西甲', homeTeam: '皇家马德里', homeFlag: 'ES', awayTeam: '塞维利亚', awayFlag: 'ES', status: 'finished', homeScore: 2, awayScore: 0, aiPrediction: { winner: 'home', confidence: 78, scorePrediction: '2:0', bar: { home: 62, draw: 22, away: 16 } } },
  ]

  // 世界杯比赛：根据日期判断状态
  const enrichedWC = worldCupMatches.map((m) => {
    const datePart = m.time.split(' ')[0]
    const status: SportMatch['status'] = datePart < today ? 'finished' : 'upcoming'
    return enrich(m, status)
  })

  if (filter === 'today') {
    return [...enrichedWC.filter((m) => m.time.startsWith(today)), ...leagueMatches.filter((m) => m.time.startsWith(today))]
  }
  if (filter === 'league') {
    return leagueMatches
  }
  if (filter === 'finished') {
    return finishedMatches
  }

  return [...enrichedWC, ...leagueMatches]
}

/** 辅助：解析 aiScore "2:1" 为 winner */
function parseScoreToWinner(score: string): 'home' | 'draw' | 'away' {
  if (!score) return 'draw'
  const [h, a] = score.split(':').map(Number)
  if (h > a) return 'home'
  if (h < a) return 'away'
  return 'draw'
}

/* ============ 8. getLiveMatch ============ */
export function getLiveMatch(matchId?: string) {
  if (matchId) {
    const found = worldCupMatches.find((m) => m.id === matchId)
    if (found) return found
  }
  return worldCupMatches[0] || null
}

/* ============ 9. getAIAnalysis ============ */
export function getAIAnalysis(): AIAnalysisResult {
  return {
    summary: '综合球队近期状态、伤病名单、交锋历史及赔率波动分析，本场比赛主队占据明显优势。主队近 5 场 4 胜 1 平保持不败，进攻端场均 2.4 球的效率冠绝联赛；客队近 3 个客场 1 平 2 负且主力中卫伤缺。欧赔主胜从 1.85 降至 1.72，市场信心持续聚拢。预计主队 2-0 或 2-1 取胜概率 65% 以上。',
    keyFactors: [
      '主队近 5 场 4 胜 1 平，场均进球 2.4',
      '客队主力中卫累计黄牌停赛，防线存在明显短板',
      '欧赔主胜赔率从 1.85 降至 1.72',
      '历史交锋主队 6 胜 3 平 1 负占据绝对优势',
      '主队主场本赛季 12 胜 2 平 1 负，胜率高达 80%',
    ],
    confidence: 72.5,
    recommendation: '建议关注主胜（-0.5/1），稳健型可选双胜彩（主胜+平局）做保险配置。',
  }
}

/* ============ 10. getHandicapData ============ */
export function getHandicapData(): HandicapItem[] {
  // 从现有比赛数据构建 team 名称映射
  const allMatches = [...worldCupMatches, ...getSportMatches('league')]
  const matchMap = new Map(allMatches.map((m) => [m.id, m]))

  const raw = [
    { matchId: 'wc001', homeOdds: 1.85, drawOdds: 3.4, awayOdds: 4.2, handicap: '-0.5', handicapHome: 0.92, handicapAway: 0.94 },
    { matchId: 'wc002', homeOdds: 1.45, drawOdds: 4.0, awayOdds: 7.5, handicap: '-1', handicapHome: 0.88, handicapAway: 0.98 },
    { matchId: 'wc003', homeOdds: 5.5, drawOdds: 3.6, awayOdds: 1.62, handicap: '+1', handicapHome: 0.95, handicapAway: 0.91 },
    { matchId: 'wc004', homeOdds: 2.5, drawOdds: 3.0, awayOdds: 2.9, handicap: '0', handicapHome: 1.02, handicapAway: 0.84 },
    { matchId: 'wc005', homeOdds: 1.18, drawOdds: 6.5, awayOdds: 15.0, handicap: '-2', handicapHome: 0.90, handicapAway: 0.96 },
    { matchId: 'wc006', homeOdds: 1.7, drawOdds: 3.5, awayOdds: 5.0, handicap: '-0.5/1', handicapHome: 0.93, handicapAway: 0.93 },
    { matchId: 'wc007', homeOdds: 2.8, drawOdds: 3.2, awayOdds: 2.45, handicap: '0', handicapHome: 0.96, handicapAway: 0.90 },
    { matchId: 'wc008', homeOdds: 1.6, drawOdds: 3.7, awayOdds: 5.5, handicap: '-0.5/1', handicapHome: 0.89, handicapAway: 0.97 },
    { matchId: 'pl001', homeOdds: 2.15, drawOdds: 3.3, awayOdds: 3.25, handicap: '-0/0.5', handicapHome: 0.95, handicapAway: 0.91 },
    { matchId: 'pl002', homeOdds: 1.95, drawOdds: 3.4, awayOdds: 3.7, handicap: '-0.5', handicapHome: 0.93, handicapAway: 0.93 },
    { matchId: 'pl005', homeOdds: 1.68, drawOdds: 3.8, awayOdds: 4.6, handicap: '-0.5/1', handicapHome: 0.91, handicapAway: 0.95 },
  ]

  return raw.map((r) => {
    const m = matchMap.get(r.matchId)
    const homeName = m ? ('homeTeam' in m ? m.homeTeam : m.home) : ''
    const awayName = m ? ('awayTeam' in m ? m.awayTeam : m.away) : ''
    return {
      ...r,
      homeTeam: homeName,
      awayTeam: awayName,
    }
  })
}

/* ============ 11. getKpiStats ============ */
export function getKpiStats(): KpiStats {
  return {
    totalPredictions: 42,
    accuracy: 68.5,
    accuracyChange: 2.1,
    checkinDays: 7,
    points: 365,
    weeklyPredictions: 8,
  }
}

/* ============ 12. getAccuracyBreakdown ============ */
export function getAccuracyBreakdown() {
  return accuracyStats
}

export interface PredictionHistoryRecord {
  id: number
  date: string
  type: 'ssq' | 'dlt' | 'worldcup'
  prediction: string
  actual: string | null
  result: 'hit' | 'miss' | 'partial' | 'pending'
  hitDetail: string
  points: number
}

/* ============ 13. getPredictionHistory ============ */
export function getPredictionHistory(type?: string, limit: number = 20): PredictionHistoryRecord[] {
  let filtered = predictionsSeed

  if (type && type !== 'all') {
    if (type === 'hit') {
      filtered = filtered.filter((p) => p.isHit)
    } else if (type === 'miss') {
      filtered = filtered.filter((p) => !p.isHit)
    } else {
      filtered = filtered.filter((p) => p.type === type)
    }
  }

  const typeMap: Record<string, 'ssq' | 'dlt' | 'worldcup'> = {
    ssq: 'ssq', dlt: 'dlt', '3d': 'worldcup', sport: 'worldcup', pl5: 'worldcup',
  }

  return filtered.slice(0, limit).map((r) => ({
    id: r.id,
    date: r.date.slice(0, 10),
    type: typeMap[r.type] || 'ssq',
    prediction: r.numbers,
    actual: r.result || null,
    result: (r.result ? (r.isHit ? 'hit' as const : (r.hit >= 3 ? 'partial' as const : 'miss' as const)) : 'pending' as const),
    hitDetail: r.isHit ? '命中' : (r.hit >= 3 ? `命中 ${r.hit} 个` : '未命中'),
    points: r.isHit ? 20 : (r.hit >= 3 ? 5 : 0),
  }))
}

/* ============ 14. getRecentTrend ============ */
export function getRecentTrend(): RecentTrendItem[] {
  const today = new Date('2026-06-18')
  const data: RecentTrendItem[] = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = `${d.getMonth() + 1}月${d.getDate()}日`

    // 略有波动但整体上升的趋势
    const predictions = 4 + Math.floor(Math.random() * 5) // 4~8
    const accuracy = +(60 + i * 1.8 + Math.random() * 3).toFixed(1) // 60~74

    data.push({ date: dateStr, accuracy, predictions })
  }

  return data
}

/* ============ 15. getTodayRecommendations ============ */
export function getTodayRecommendations(): TodayRecommendation[] {
  return [
    {
      id: 'rec-001',
      type: 'match',
      title: '阿森纳 vs 利物浦',
      subtitle: '英超焦点战 · 06-18 02:30',
      confidence: 72,
      detail: 'AI 预测：阿森纳 2-1 利物浦（主胜概率 58%）',
    },
    {
      id: 'rec-002',
      type: 'lottery',
      title: '双色球 2026066 期',
      subtitle: '今晚 21:15 开奖',
      confidence: 65,
      detail: 'AI 推荐红球：02,09,14,21,27,32 | 蓝球：05,11',
    },
    {
      id: 'rec-003',
      type: 'match',
      title: '国际米兰 vs 尤文图斯',
      subtitle: '意甲国家德比 · 06-18 02:30',
      confidence: 68,
      detail: 'AI 预测：国米 1-0 尤文（主胜概率 52%，小球概率 70%）',
    },
    {
      id: 'rec-004',
      type: 'lottery',
      title: '大乐透 2026066 期',
      subtitle: '明晚 20:25 开奖',
      confidence: 60,
      detail: 'AI 推荐前区：04,10,16,24,31 | 后区：06,10',
    },
    {
      id: 'rec-005',
      type: 'match',
      title: '巴西 vs 摩洛哥',
      subtitle: '世界杯小组赛 · 06-18 06:00',
      confidence: 85,
      detail: 'AI 预测：巴西 3-1 摩洛哥（主胜概率 82%）',
    },
  ]
}

/* ============ 16. getKnockoutBracket ============ */
export function getKnockoutBracket(): KnockoutSlot[][] {
  return knockoutBracket
}

/* ============ 17. getGroupStandings ============ */
export function getGroupStandings(): Record<string, GroupStanding[]>
export function getGroupStandings(group: string): GroupStanding[]
export function getGroupStandings(group?: string): Record<string, GroupStanding[]> | GroupStanding[] {
  if (group) {
    return groupStandings[group] || []
  }
  return groupStandings
}

/* ============ 18. getTournamentStats ============ */
export function getTournamentStats() {
  return tournamentStats
}

/* ============ 19. getTopScorers ============ */
export function getTopScorers(): Scorer[] {
  return topScorers
}

/* ============ 20. getMemberPlans ============ */
export function getMemberPlans(): MemberPlan[] {
  return [
    {
      id: 'free',
      name: '免费版',
      price: 0,
      features: ['每日 3 次 AI 预测', '基础数据分析', '文字直播', '基础积分系统'],
      recommended: false,
    },
    {
      id: 'premium',
      name: '高级会员',
      price: 29.9,
      originalPrice: 39.9,
      features: ['无限次 AI 预测', '深度数据分析', '实时高清直播', '专属 AI 分析报告', '优先客服支持', '去广告体验'],
      recommended: true,
    },
    {
      id: 'pro',
      name: '专业版',
      price: 59.9,
      originalPrice: 79.9,
      features: ['高级会员全部权益', '大数据模型预测', '赛事数据 API 接口', '定制化策略回测', '一对一专家咨询', 'VIP 线下活动邀请'],
      recommended: false,
    },
  ]
}

/* ============ 21. getMemberFeatures ============ */
export function getMemberFeatures(): MemberFeature[] {
  return [
    { feature: 'AI 预测次数', free: '每日 3 次', premium: '无限次', pro: '无限次' },
    { feature: '数据分析深度', free: '基础', premium: '深度', pro: '大数据模型' },
    { feature: '赛事直播', free: '文字直播', premium: '高清直播', pro: '多路高清直播' },
    { feature: 'AI 分析报告', free: false, premium: true, pro: true },
    { feature: '历史数据回溯', free: '近 7 天', premium: '近 1 年', pro: '全量历史数据' },
    { feature: '策略回测', free: false, premium: false, pro: true },
    { feature: '数据 API', free: false, premium: false, pro: true },
    { feature: '去广告', free: false, premium: true, pro: true },
    { feature: '客服支持', free: '邮件', premium: '优先', pro: '一对一专家' },
    { feature: '线下活动', free: false, premium: false, pro: 'VIP 邀请' },
  ]
}

/* ============ 22. getPointsRules ============ */
export function getPointsRules(): PointsRule[] {
  return [
    { action: '每日签到', points: 10, description: '每日首次签到获得 10 积分', limit: '每日 1 次' },
    { action: '连续签到 7 天', points: 100, description: '连续签到满 7 天额外奖励 100 积分', limit: '每 7 天 1 次' },
    { action: '完成 AI 预测', points: 5, description: '每次使用 AI 预测功能获得 5 积分', limit: '每日 5 次' },
    { action: '分享预测结果', points: 20, description: '将预测结果分享到社区获得 20 积分', limit: '每日 3 次' },
    { action: '预测命中', points: 50, description: 'AI 预测结果与开奖结果匹配获得 50 积分', limit: '无限制' },
    { action: '邀请好友', points: 200, description: '每成功邀请一位好友注册获得 200 积分', limit: '无限制' },
    { action: '参与竞猜', points: 15, description: '参与赛事竞猜互动获得 15 积分', limit: '每日 10 次' },
    { action: '竞猜获胜', points: 30, description: '竞猜结果正确额外获得 30 积分', limit: '无限制' },
    { action: '完善资料', points: 50, description: '完善个人资料一次性奖励 50 积分', limit: '仅 1 次' },
    { action: '首次充值', points: 500, description: '首次充值任意金额获得 500 积分奖励', limit: '仅 1 次' },
  ]
}

/* ============ 补充：已有页面引用的便捷函数 ============ */

/** 返回所有世界杯比赛数据 */
export function getWorldCupMatches(): Match[] {
  return worldCupMatches
}

/** 返回比赛日期列表 */
export function getMatchDates() {
  return matchDates
}

/** 返回小组名称列表 */
export function getGroupNames(): string[] {
  return groupNames
}

/** 返回文字直播弹幕池 */
export function getDanmakuPool(): string[] {
  return danmakuPool
}

/* ============ mockLotteryDraws ============ */
/** 当真实彩票 API 不可用时，返回模拟开奖数据供引擎分析使用。
 *  数据格式兼容 lib/engine/lottery.ts 中的 LotteryDraw 接口。 */
export function mockLotteryDraws(count: number = 50) {
  const draws: { period: string; date: string; reds: number[]; blues: number[]; raw: string }[] = []

  // 从 predictionsSeed 中提取双色球记录
  for (const p of predictionsSeed) {
    if (p.type !== 'ssq') continue
    const parts = p.numbers.replace(/[|｜]/g, '|').split('|')
    const reds = parts[0].split(',').map(Number).filter(n => !isNaN(n))
    const blues = parts[1] ? parts[1].split(',').map(Number).filter(n => !isNaN(n)) : []
    if (reds.length === 6 && blues.length >= 1) {
      draws.push({ period: p.period, date: p.date, reds, blues, raw: p.numbers })
    }
  }

  const redPools = [5, 11, 18, 23, 27, 33, 2, 9, 14, 21, 26, 32, 3, 8, 15, 22, 28, 31, 1, 7, 13, 19, 25, 30, 4, 10, 16, 20, 24, 29]
  const bluePool = [9, 5, 12, 7, 14, 3, 11, 6, 15, 8, 4, 13, 10, 16, 2, 1]

  for (let i = draws.length; i < count; i++) {
    const seed = i * 7
    const reds = Array.from({ length: 6 }, (_, j) => {
      const n = redPools[(seed + j * 3) % redPools.length]
      return ((n + Math.floor(seed / 13) - 1) % 33) + 1
    }).sort((a, b) => a - b)
    const blues = [bluePool[seed % bluePool.length]]
    const periodNum = 2026065 - (i + 1)
    const day = 28 - (i % 28)
    draws.push({
      period: String(periodNum),
      date: `2026-06-${String(day).padStart(2, '0')} 10:00:00`,
      reds,
      blues,
      raw: `${reds.join(',')}|${blues[0]}`,
    })
  }

  return draws.slice(0, count)
}
