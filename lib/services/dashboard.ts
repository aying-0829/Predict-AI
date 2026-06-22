export type KpiStats = {
  totalPredictions: number
  accuracy: number
  accuracyChange: number
  checkinDays: number
  points: number
  weeklyPredictions: number
}

export function getKpiStats(): KpiStats {
  return {
    totalPredictions: 342,
    accuracy: 68.4,
    accuracyChange: 2.1,
    checkinDays: 87,
    points: 2840,
    weeklyPredictions: 12,
  }
}

export type AccuracyBreakdown = {
  hits: number
  misses: number
  partials: number
  maxStreak: number
}

export function getAccuracyBreakdown(): AccuracyBreakdown {
  return {
    hits: 234,
    misses: 108,
    partials: 34,
    maxStreak: 12,
  }
}

export type PredictionRecord = {
  id: number
  date: string
  type: 'ssq' | 'dlt' | 'worldcup'
  prediction: string
  actual: string | null
  result: 'pending' | 'hit' | 'miss' | 'partial'
  hitDetail: string
  points: number
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

export function getPredictionHistory(
  filterType?: string,
  limit = 20
): PredictionRecord[] {
  const rng = seededRandom(42)
  const types: PredictionRecord['type'][] = ['ssq', 'dlt', 'worldcup']

  const predictionText: Record<PredictionRecord['type'], string[]> = {
    ssq: ['05 11 18 23 27 33 + 09', '02 08 14 21 25 30 + 12', '03 09 15 22 28 31 + 07', '04 10 16 19 26 32 + 14', '01 07 13 20 24 29 + 05', '06 12 17 21 25 33 + 08', '03 08 14 22 27 31 + 11', '05 10 15 19 26 30 + 04', '02 09 16 23 28 32 + 13', '07 11 18 20 24 29 + 06'],
    dlt: ['07 13 22 25 31 + 04 09', '03 11 17 24 29 + 06 11', '05 14 19 27 33 + 02 08', '08 12 21 26 30 + 05 10', '02 09 16 23 28 + 03 07'],
    worldcup: ['巴西 2-0 摩洛哥', '卡塔尔 1-1 瑞士', '德国 3-1 日本', '法国 2-0 澳大利亚', '阿根廷 1-0 荷兰', '英格兰 2-1 塞内加尔', '葡萄牙 1-1 乌拉圭', '西班牙 3-0 哥斯达黎加'],
  }

  const actualText: Record<PredictionRecord['type'], string[]> = {
    ssq: ['05 11 18 23 27 33 + 09', '02 08 14 21 25 30 + 11', '03 10 15 22 28 31 + 07', '04 10 17 19 26 32 + 14', '01 07 13 22 24 29 + 16', '06 11 17 21 25 33 + 08', null as any, null as any, '02 09 16 23 28 32 + 13', null as any],
    dlt: ['07 13 22 25 31 + 04 09', '04 11 17 24 29 + 06 11', '05 14 19 27 33 + 03 08', '08 12 20 26 30 + 05 10', null as any],
    worldcup: ['巴西 2-0 摩洛哥', '卡塔尔 0-3 瑞士', '德国 3-1 日本', '法国 1-0 澳大利亚', null as any, '英格兰 3-0 塞内加尔', null as any, null as any],
  }

  const hitDetailText: Record<string, string[]> = {
    hit: ['6+1 全中', '5+1 命中17注', '4+1 命中', '比分完全命中', '胜负+比分全中'],
    miss: ['仅命中2+0', '仅命中蓝球', '仅命中3+0', '比分偏差', '胜负预测错误'],
    partial: ['命中5+0 差蓝球', '命中4+1', '胜负正确 比分偏差', '方向正确 净胜球偏差'],
  }

  const allRecords: PredictionRecord[] = []
  const now = new Date('2026-06-14')

  for (let i = 0; i < 50; i++) {
    const typeIdx = Math.floor(rng() * 3)
    const type = types[typeIdx]
    const d = new Date(now)
    d.setDate(d.getDate() - i)

    const r = rng()
    let result: PredictionRecord['result']
    let actual: string | null
    if (i < 2 || (i < 5 && r > 0.6)) {
      result = 'pending'
      actual = null
    } else {
      const r2 = rng()
      if (r2 < 0.55) result = 'hit'
      else if (r2 < 0.85) result = 'miss'
      else result = 'partial'
      actual = actualText[type][i % actualText[type].length]
      if (actual === null) {
        result = 'pending'
      }
    }

    const txtArr = predictionText[type]
    const pred = txtArr[i % txtArr.length]

    let hd = ''
    if (result === 'hit') hd = hitDetailText.hit[i % hitDetailText.hit.length]
    else if (result === 'miss') hd = hitDetailText.miss[i % hitDetailText.miss.length]
    else if (result === 'partial') hd = hitDetailText.partial[i % hitDetailText.partial.length]

    const pts = result === 'hit' ? Math.floor(rng() * 50) + 20 : result === 'partial' ? Math.floor(rng() * 15) + 5 : 0

    allRecords.push({
      id: 1000 - i,
      date: d.toISOString().slice(0, 10),
      type,
      prediction: pred,
      actual: result === 'pending' ? null : (actual || '待开奖'),
      result,
      hitDetail: hd,
      points: result === 'pending' ? 0 : pts,
    })
  }

  let filtered = allRecords
  if (filterType && filterType !== 'all') {
    if (filterType === 'hit') {
      filtered = allRecords.filter(r => r.result === 'hit')
    } else {
      filtered = allRecords.filter(r => r.type === filterType)
    }
  }

  return filtered.slice(0, limit)
}

export type TrendPoint = {
  date: string
  hitCount: number
  detail: string
}

export function getRecentTrend(): TrendPoint[] {
  const rng = seededRandom(77)
  const now = new Date('2026-06-14')
  const details = [
    '6+1 全中',
    '命中 5+1',
    '命中 4+1',
    '仅中蓝球',
    '命中 5+0',
    '命中 4+1',
    '命中 3+1',
    '命中 6+0',
  ]
  const trend: TrendPoint[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i * 3)
    trend.push({
      date: d.toISOString().slice(0, 10),
      hitCount: Math.floor(rng() * 3) + 1,
      detail: details[i % details.length],
    })
  }
  return trend
}

export type TodayRecommendation = {
  type: 'ssq' | 'dlt'
  numbers: { reds: number[]; blue: number | number[] }
  confidence: number
}

export function getTodayRecommendations(): TodayRecommendation[] {
  return [
    {
      type: 'ssq',
      numbers: { reds: [5, 11, 18, 23, 27, 33], blue: 9 },
      confidence: 76,
    },
    {
      type: 'dlt',
      numbers: { reds: [7, 13, 22, 25, 31], blue: [4, 9] },
      confidence: 72,
    },
  ]
}

export type LiveMatchInfo = {
  home: string
  away: string
  homeScore: number
  awayScore: number
  minute: number
  aiPrediction: string
  aiConfidence: number
  status: 'live' | 'finished' | 'upcoming'
  homeFlag: string
  awayFlag: string
  aiScore: string
  homeWin: number
  draw: number
  awayWin: number
}

export function getLiveMatch(_matchId?: string): LiveMatchInfo {
  return {
    home: '巴西',
    away: '摩洛哥',
    homeScore: 2,
    awayScore: 1,
    minute: 67,
    aiPrediction: '巴西胜',
    aiConfidence: 67,
    status: 'live',
    homeFlag: 'BR',
    awayFlag: 'MA',
    aiScore: '3:1',
    homeWin: 58,
    draw: 20,
    awayWin: 22,
  }
}
