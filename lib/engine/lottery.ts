/**
 * Lottery Analysis Engine
 * Hot-cold analysis, frequency statistics, recommendations.
 */

export interface LotteryDraw {
  period: string
  date: string
  reds: number[]
  blues: number[]
  raw?: string
}

export interface FrequencyItem {
  number: number
  frequency: number
  probability: number
}

export interface LotteryAnalysis {
  frequency: { reds: FrequencyItem[]; blues: FrequencyItem[] }
  hotCold: { hot: { number: number; type: 'red' | 'blue' }[]; cold: { number: number; type: 'red' | 'blue'; missCount: number }[] }
  miss: { number: number; type: 'red' | 'blue'; missCount: number; maxMiss: number }[]
  zoneDist: { zone1: number; zone2: number; zone3: number }
  oddEven: { odd: number; even: number }
}

export interface LotteryRecommendation {
  reds: number[]
  blues: number[]
  confidence: number
  reasoning: string
}

/**
 * Analyze hot/cold numbers from historical draws.
 */
export function analyzeHotCold(draws: LotteryDraw[], redMax: number = 33, blueMax: number = 16): LotteryAnalysis {
  const total = draws.length
  const redFreq: Record<number, number> = {}
  const blueFreq: Record<number, number> = {}

  for (let i = 1; i <= redMax; i++) redFreq[i] = 0
  for (let i = 1; i <= blueMax; i++) blueFreq[i] = 0

  // Count frequencies
  draws.forEach(d => {
    d.reds.forEach(n => { if (redFreq[n] !== undefined) redFreq[n]++ })
    d.blues.forEach(n => { if (blueFreq[n] !== undefined) blueFreq[n]++ })
  })

  // Build frequency lists
  const redFreqs: FrequencyItem[] = Object.entries(redFreq).map(([n, f]) => ({
    number: +n,
    frequency: f,
    probability: Math.round(((f / Math.max(total, 1)) * 100) * 10) / 10,
  }))
  const blueFreqs: FrequencyItem[] = Object.entries(blueFreq).map(([n, f]) => ({
    number: +n,
    frequency: f,
    probability: Math.round(((f / Math.max(total, 1)) * 100) * 10) / 10,
  }))

  // Sort by frequency
  redFreqs.sort((a, b) => b.frequency - a.frequency)
  blueFreqs.sort((a, b) => b.frequency - a.frequency)

  // Hot: top 30%, Cold: bottom 30%
  const hotCutoff = Math.ceil(redFreqs.length * 0.3)
  const coldCutoff = Math.floor(redFreqs.length * 0.7)

  const hotReds = redFreqs.slice(0, hotCutoff).map(r => ({ number: r.number, type: 'red' as const }))
  const coldReds = redFreqs.slice(coldCutoff).map(r => ({ number: r.number, type: 'red' as const, missCount: total - r.frequency }))

  const hotBlues = blueFreqs.slice(0, Math.ceil(blueFreqs.length * 0.3)).map(b => ({ number: b.number, type: 'blue' as const }))
  const coldBlues = blueFreqs.slice(Math.floor(blueFreqs.length * 0.7)).map(b => ({ number: b.number, type: 'blue' as const, missCount: total - b.frequency }))

  // Miss analysis — find last appearance
  const missStats: LotteryAnalysis['miss'] = []
  for (const rf of redFreqs) {
    let lastIdx = -1
    for (let i = draws.length - 1; i >= 0; i--) {
      if (draws[i].reds.includes(rf.number)) { lastIdx = draws.length - 1 - i; break }
    }
    missStats.push({
      number: rf.number,
      type: 'red',
      missCount: lastIdx === -1 ? total : lastIdx,
      maxMiss: total,
    })
  }
  for (const bf of blueFreqs) {
    let lastIdx = -1
    for (let i = draws.length - 1; i >= 0; i--) {
      if (draws[i].blues.includes(bf.number)) { lastIdx = draws.length - 1 - i; break }
    }
    missStats.push({
      number: bf.number,
      type: 'blue',
      missCount: lastIdx === -1 ? total : lastIdx,
      maxMiss: total,
    })
  }

  // Zone distribution
  let zone1 = 0, zone2 = 0, zone3 = 0
  const z1Max = Math.floor(redMax / 3)
  const z2Max = Math.floor(redMax / 3) * 2
  draws.forEach(d => {
    d.reds.forEach(n => {
      if (n <= z1Max) zone1++
      else if (n <= z2Max) zone2++
      else zone3++
    })
  })
  const zTotal = zone1 + zone2 + zone3 || 1

  // Odd/even
  let odd = 0, even = 0
  draws.forEach(d => {
    d.reds.forEach(n => { if (n % 2 === 1) odd++; else even++ })
  })

  return {
    frequency: { reds: redFreqs, blues: blueFreqs },
    hotCold: {
      hot: [...hotReds, ...hotBlues],
      cold: [...coldReds, ...coldBlues],
    },
    miss: missStats.sort((a, b) => b.missCount - a.missCount),
    zoneDist: {
      zone1: Math.round((zone1 / zTotal) * 100),
      zone2: Math.round((zone2 / zTotal) * 100),
      zone3: Math.round((zone3 / zTotal) * 100),
    },
    oddEven: { odd, even },
  }
}

/**
 * Generate number recommendations based on analysis.
 */
export function generateRecommendations(
  analysis: LotteryAnalysis,
  redCount: number = 6,
  blueCount: number = 1,
): LotteryRecommendation[] {
  const results: LotteryRecommendation[] = []

  // Strategy 1: Balanced hot + cold
  const hotReds = analysis.hotCold.hot.filter(h => h.type === 'red').map(h => h.number)
  const coldReds = analysis.hotCold.cold.filter(c => c.type === 'red').map(c => c.number)
  const hotBlues = analysis.hotCold.hot.filter(h => h.type === 'blue').map(h => h.number)
  const coldBlues = analysis.hotCold.cold.filter(c => c.type === 'blue').map(c => c.number)

  function weightedPick(pool: number[], preferred: number[], k: number): number[] {
    const available = Array.from(new Set([...preferred, ...pool]))
    const picked: number[] = []
    const working = [...available]
    for (let i = 0; i < k && working.length > 0; i++) {
      const idx = Math.floor(Math.random() * Math.min(working.length, Math.max(k * 2, preferred.length)))
      const pick = working.splice(idx, 1)[0]
      picked.push(pick)
      if (preferred.includes(pick)) {
        preferred = preferred.filter(p => p !== pick)
      }
    }
    return picked.sort((a, b) => a - b)
  }

  // Recommendation 1: 3 hot + 3 cold reds
  const r1 = weightedPick(
    analysis.frequency.reds.map(r => r.number),
    [...hotReds.slice(0, 3), ...coldReds.slice(0, 3)],
    redCount,
  )
  const b1 = weightedPick(
    analysis.frequency.blues.map(b => b.number),
    [...hotBlues.slice(0, 1), ...coldBlues.slice(0, 1)],
    blueCount,
  )
  results.push({
    reds: r1,
    blues: b1,
    confidence: 72,
    reasoning: '冷热均衡策略：3热号+3冷号，兼顾频率趋势与遗漏回补。',
  })

  // Recommendation 2: Weighted by frequency
  const freqPool = [...analysis.frequency.reds].sort((a, b) => b.frequency - a.frequency)
  const r2 = weightedPick(freqPool.map(r => r.number), freqPool.slice(0, 8).map(r => r.number), redCount)
  const bfPool = [...analysis.frequency.blues].sort((a, b) => b.frequency - a.frequency)
  const b2 = weightedPick(bfPool.map(b => b.number), bfPool.slice(0, 4).map(b => b.number), blueCount)
  results.push({
    reds: r2,
    blues: b2,
    confidence: 68,
    reasoning: '高频优先策略：基于历史频率加权随机选择，偏重近期热号。',
  })

  return results
}
