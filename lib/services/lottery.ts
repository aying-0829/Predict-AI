function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

// return sorted array of k unique ints in [min, max]
function pickUnique(rng: () => number, min: number, max: number, k: number): number[] {
  const pool: number[] = []
  for (let i = min; i <= max; i++) pool.push(i)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, k).sort((a, b) => a - b)
}

export type LotteryType = 'ssq' | 'dlt' | '3d'

export type LotteryHistoryItem = {
  period: string
  date: string
  reds: number[]
  blue: number
  sum: number
  oddEven: string
  zone: string
}

export function getLotteryHistory(type: LotteryType, limit = 50) {
  const rng = seededRandom(type === 'ssq' ? 42 : type === 'dlt' ? 137 : 299)
  const results: LotteryHistoryItem[] = []
  let year = 2026
  let issue = type === 'ssq' ? 2026066 : type === 'dlt' ? 2026066 : 2026166
  let day = 14
  let month = 6

  for (let i = 0; i < limit; i++) {
    day -= type === 'ssq' ? 3 : type === 'dlt' ? 2 : 1
    if (day <= 0) {
      month--
      if (month <= 0) { month = 12; year-- }
      day += 30
    }
    const d = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    let reds: number[]
    let blue: number
    if (type === 'ssq') {
      reds = pickUnique(rng, 1, 33, 6)
      blue = Math.floor(rng() * 16) + 1
    } else if (type === 'dlt') {
      reds = pickUnique(rng, 1, 35, 5)
      blue = Math.floor(rng() * 12) + 1
    } else {
      reds = [Math.floor(rng() * 10), Math.floor(rng() * 10), Math.floor(rng() * 10)]
      blue = -1
    }

    const sum = reds.reduce((a, b) => a + b, 0)
    const oddCount = reds.filter(n => n % 2 === 1).length
    const evenCount = reds.length - oddCount
    const zone = (() => {
      const z1 = reds.filter(n => type === 'ssq' ? n <= 11 : n <= 12).length
      const z2 = reds.filter(n => type === 'ssq' ? n >= 12 && n <= 22 : n >= 13 && n <= 24).length
      const z3 = reds.length - z1 - z2
      return `${z1}:${z2}:${z3}`
    })()

    results.push({
      period: `第 ${issue} 期`,
      date: d,
      reds,
      blue,
      sum,
      oddEven: `${oddCount}:${evenCount}`,
      zone,
    })
    issue--
  }
  return results
}

export type HotColdItem = {
  number: number
  frequency?: number
  probability?: number
  lastAppearance?: number
  currentMiss?: number
  maxMiss?: number
  alert?: 'high' | 'warn'
  type: 'red' | 'blue'
}

export function getHotColdAnalysis(type: LotteryType) {
  const history = getLotteryHistory(type, 50)
  const rng = seededRandom(type === 'ssq' ? 442 : type === 'dlt' ? 537 : 699)
  const redMax = type === 'dlt' ? 35 : type === '3d' ? 9 : 33
  const blueMax = type === '3d' ? 0 : type === 'dlt' ? 12 : 16

  const redFreq: Record<number, number> = {}
  const blueFreq: Record<number, number> = {}
  for (let i = 1; i <= redMax; i++) redFreq[i] = 0
  for (let i = 1; i <= blueMax; i++) blueFreq[i] = 0

  const redLast: Record<number, number> = {}
  const blueLast: Record<number, number> = {}
  for (let i = 1; i <= redMax; i++) redLast[i] = 99
  for (let i = 1; i <= blueMax; i++) blueLast[i] = 99

  const historyList = history
  historyList.forEach((h, idx) => {
    h.reds.forEach(n => {
      redFreq[n] = (redFreq[n] || 0) + 1
      if (redLast[n] === 99) redLast[n] = idx
    })
    if (h.blue > 0) {
      blueFreq[h.blue] = (blueFreq[h.blue] || 0) + 1
      if (blueLast[h.blue] === 99) blueLast[h.blue] = idx
    }
  })

  const redSorted = Object.entries(redFreq).sort((a, b) => b[1] - a[1]).map(([n, f]) => ({ number: +n, frequency: f }))
  const blueSorted = Object.entries(blueFreq).sort((a, b) => b[1] - a[1]).map(([n, f]) => ({ number: +n, frequency: f }))

  const hot: HotColdItem[] = [
    ...redSorted.slice(0, 6).map(r => ({
      number: r.number,
      frequency: r.frequency,
      probability: Math.round(60 + (r.frequency / 20) * 40),
      type: 'red' as const,
    })),
    ...blueSorted.slice(0, 2).map(b => ({
      number: b.number,
      frequency: b.frequency,
      probability: Math.round(55 + (b.frequency / 15) * 40),
      type: 'blue' as const,
    })),
  ]

  const allSorted = [
    ...redSorted.map(r => ({ ...r, type: 'red' as const })),
    ...blueSorted.map(b => ({ ...b, type: 'blue' as const })),
  ].sort((a, b) => a.frequency - b.frequency)

  const cold: HotColdItem[] = allSorted.slice(0, 5).map(a => ({
    number: a.number,
    lastAppearance: redLast[a.number] ?? blueLast[a.number],
    probability: Math.round(30 + rng() * 25),
    type: a.type,
  }))

  const missed: HotColdItem[] = []
  const maxMissMap: Record<string, number> = {
    'ssq-red-4': 32, 'ssq-red-13': 30, 'ssq-red-26': 28, 'ssq-red-30': 25,
    'dlt-red-8': 28, 'dlt-red-15': 26,
    '3d-3': 15, '3d-7': 18,
  }

  const candidates = [...Object.entries(redLast).map(([n, la]) => ({ number: +n, miss: la, type: 'red' as const })),
    ...Object.entries(blueLast).map(([n, la]) => ({ number: +n, miss: la, type: 'blue' as const }))]
    .filter(c => c.miss > 15)
    .sort((a, b) => b.miss - a.miss)
    .slice(0, 5)

  candidates.forEach(c => {
    const key = `${type}-${c.type}-${c.number}`
    const maxMiss = maxMissMap[key] || Math.round(c.miss * 1.1 + 2)
    missed.push({
      number: c.number,
      currentMiss: c.miss,
      maxMiss,
      alert: c.miss > maxMiss * 0.85 ? 'high' as const : 'warn' as const,
      type: c.type,
    })
  })

  return { hot, cold, missed }
}

export type AIRecommendation = {
  reds: number[]
  blue: number
  confidence: number
  analysis: string
  numberProbabilities: { number: number; probability: number }[]
}

export function getAIPredictions(type: LotteryType) {
  const rng = seededRandom(type === 'ssq' ? 777 : type === 'dlt' ? 888 : 999)
  const redMax = type === 'dlt' ? 35 : type === '3d' ? 9 : 33
  const blueMax = type === '3d' ? 0 : type === 'dlt' ? 12 : 16
  const redCount = type === '3d' ? 3 : type === 'dlt' ? 5 : 6

  function makePrediction(): AIRecommendation {
    const reds = pickUnique(rng, 1, redMax, redCount)
    const blue = type === '3d' ? -1 : Math.floor(rng() * blueMax) + 1
    const allNumbers: { number: number; probability: number }[] = reds.map(n => ({
      number: n,
      probability: Math.round(70 + rng() * 25),
    }))
    if (blue > 0) {
      allNumbers.push({ number: blue, probability: Math.round(65 + rng() * 20) })
    }
    return { reds, blue, numberProbabilities: allNumbers, confidence: 0, analysis: '' }
  }

  const currentRaw = makePrediction()
  const nextRaw = makePrediction()

  const current: AIRecommendation = {
    reds: currentRaw.reds,
    blue: currentRaw.blue,
    numberProbabilities: currentRaw.numberProbabilities,
    confidence: type === 'ssq' ? 76 : type === 'dlt' ? 74 : 71,
    analysis: type === 'ssq'
      ? '基于近50期冷热号分布，红球区间比 2:2:2 均衡，奇偶比 3:3，蓝球 09 为近期高频号。'
      : type === 'dlt'
        ? '前区热号集中在中段，后区冷号有回补趋势，建议关注 07 和 11。'
        : '百位热号 5，十位遗漏追 3，个位近5期偶数偏多建议选奇。',
  }

  const next: AIRecommendation = {
    reds: nextRaw.reds,
    blue: nextRaw.blue,
    numberProbabilities: nextRaw.numberProbabilities,
    confidence: type === 'ssq' ? 71 : type === 'dlt' ? 68 : 65,
    analysis: type === 'ssq'
      ? '考虑大遗漏号回补可能性，红球 13、26 已接近历史最大遗漏，下期出现概率上升。'
      : type === 'dlt'
        ? '前区大号区间近期出号频繁，后区冷热搭配，保守估计仍有空间。'
        : '十位连续4期未出奇数，下期奇数概率大，推荐 1-3-7 组合。',
  }

  return { current, next }
}

export type MissStat = {
  number: number
  type: 'red' | 'blue'
  lastAppearance: string
  missCount: number
  maxMiss: number
  avgMiss: number
  alert: 'hot' | 'ok' | 'warn' | 'alert'
}

export function getMissStats(type: LotteryType) {
  const history = getLotteryHistory(type, 50)
  const redMax = type === 'dlt' ? 35 : type === '3d' ? 9 : 33
  const blueMax = type === '3d' ? 0 : type === 'dlt' ? 12 : 16

  const lastApp: Record<string, number> = {}
  const maxMiss: Record<string, number> = {}
  const missSeq: Record<string, number[]> = {}

  for (let i = 1; i <= redMax; i++) {
    const k = `red-${i}`
    lastApp[k] = -1
    maxMiss[k] = 0
    missSeq[k] = []
  }
  for (let i = 1; i <= blueMax; i++) {
    const k = `blue-${i}`
    lastApp[k] = -1
    maxMiss[k] = 0
    missSeq[k] = []
  }

  let currentMiss = 0
  for (let i = history.length - 1; i >= 0; i--) {
    const h = history[i]
    h.reds.forEach(n => {
      const k = `red-${n}`
      if (lastApp[k] === -1) lastApp[k] = currentMiss
      const m = history.length - 1 - i
      missSeq[k].push(m)
    })
    if (h.blue > 0) {
      const k = `blue-${h.blue}`
      if (lastApp[k] === -1) lastApp[k] = currentMiss
      missSeq[k].push(history.length - 1 - i)
    }
    currentMiss++
  }

  const stats: MissStat[] = []

  const build = (num: number, typ: 'red' | 'blue') => {
    const k = `${typ}-${num}`
    const la = lastApp[k] === -1 ? 50 : lastApp[k]
    const seq = missSeq[k] || []
    let maxGap = 0
    let prev = -1
    const sorted = [...seq].sort((a, b) => a - b)
    sorted.forEach(p => {
      const gap = p - prev - 1
      if (gap > maxGap) maxGap = gap
      prev = p
    })
    const lastGap = 50 - 1 - (sorted.length > 0 ? sorted[sorted.length - 1] : -1)
    if (lastGap > maxGap) maxGap = lastGap + 1

    if (maxGap < 3) maxGap = Math.round(8 + Math.random() * 25)
    if (la === 50) maxGap = Math.max(maxGap, 30)

    const avgMiss = seq.length > 1
      ? Math.round(50 / seq.length * 10) / 10
      : Math.round((5 + Math.random() * 8) * 10) / 10

    let alert: MissStat['alert'] = 'ok'
    if (la === 0) alert = 'hot'
    else if (la > maxGap * 0.85) alert = 'alert'
    else if (la > maxGap * 0.6) alert = 'warn'

    const lastPeriod = history.length - 1 - la
    const lastAppStr = la === 0
      ? history[history.length - 1].period
      : la >= history.length
        ? '超过50期'
        : history[lastPeriod >= 0 ? lastPeriod : 0]?.period || '未知'

    stats.push({
      number: num,
      type: typ,
      lastAppearance: lastAppStr,
      missCount: la,
      maxMiss: maxGap,
      avgMiss,
      alert,
    })
  }

  for (let i = 1; i <= redMax; i++) build(i, 'red')
  for (let i = 1; i <= blueMax; i++) build(i, 'blue')

  return stats
}

export type LotteryTypeInfo = {
  id: LotteryType
  name: string
}

export function getLotteryTypes(): LotteryTypeInfo[] {
  return [
    { id: 'ssq', name: '双色球' },
    { id: 'dlt', name: '大乐透' },
    { id: '3d', name: '福彩3D' },
  ]
}

// Mock lottery draw data (used by legacy lottery page and API fallback)
export type LotteryDrawData = {
  id: string
  name: string
  period: string
  date: string
  redBalls: number[]
  blueBalls: number[]
  aiRecommend: { red: number[]; blue: number[] }
}

export function getLotteryData(): LotteryDrawData[] {
  return [
    {
      id: 'ssq001',
      name: '双色球',
      period: '第 2026066 期',
      date: '2026-06-14',
      redBalls: [5, 11, 18, 23, 27, 33],
      blueBalls: [9],
      aiRecommend: { red: [5, 11, 18, 23, 27, 33], blue: [9] },
    },
    {
      id: 'ssq002',
      name: '双色球',
      period: '第 2026065 期',
      date: '2026-06-11',
      redBalls: [2, 8, 14, 20, 26, 31],
      blueBalls: [7],
      aiRecommend: { red: [3, 9, 15, 21, 27, 32], blue: [7] },
    },
    {
      id: 'ssq003',
      name: '双色球',
      period: '第 2026064 期',
      date: '2026-06-08',
      redBalls: [1, 7, 13, 19, 25, 30],
      blueBalls: [12],
      aiRecommend: { red: [1, 7, 13, 19, 25, 30], blue: [12] },
    },
    {
      id: 'dlt001',
      name: '大乐透',
      period: '第 2026066 期',
      date: '2026-06-14',
      redBalls: [3, 12, 18, 25, 33],
      blueBalls: [5, 11],
      aiRecommend: { red: [3, 12, 18, 25, 33], blue: [5, 11] },
    },
    {
      id: 'dlt002',
      name: '大乐透',
      period: '第 2026065 期',
      date: '2026-06-11',
      redBalls: [1, 9, 16, 22, 30],
      blueBalls: [3, 8],
      aiRecommend: { red: [2, 10, 17, 23, 31], blue: [3, 8] },
    },
    {
      id: '3d001',
      name: '福彩3D',
      period: '第 2026166 期',
      date: '2026-06-14',
      redBalls: [5, 3, 7],
      blueBalls: [],
      aiRecommend: { red: [5, 3, 7], blue: [] },
    },
  ]
}
