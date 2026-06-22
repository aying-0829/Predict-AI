import { NextRequest, NextResponse } from 'next/server'
import { getHotColdAnalysis } from '@/lib/services'
import { getRealLotteryData } from '@/lib/lotteryRealData'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') as 'ssq' | 'dlt' | '3d' | null

  if (!type || !['ssq', 'dlt', '3d'].includes(type)) {
    return NextResponse.json({ code: -1, message: 'Invalid type parameter' }, { status: 400 })
  }

  try {
    const draws = await getRealLotteryData(type, 50)
    if (draws && draws.length > 0) {
      const data = computeHotCold(draws, type)
      return NextResponse.json({ code: 0, data, source: '500.com' })
    }
  } catch {
    // fallback
  }

  return NextResponse.json({ code: 0, data: getHotColdAnalysis(type), source: 'mock' })
}

// ── 基于真实数据的冷热号计算 ────────────────────────────────

function computeHotCold(
  draws: { reds: number[]; blues: number[] }[],
  type: string,
) {
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

  draws.forEach((d, idx) => {
    d.reds.forEach(n => { if (redFreq[n] !== undefined) redFreq[n]++; if (redLast[n] === 99) redLast[n] = idx })
    d.blues.forEach(n => { if (blueFreq[n] !== undefined) blueFreq[n]++; if (blueLast[n] === 99) blueLast[n] = idx })
  })

  const total = draws.length
  const redSorted = Object.entries(redFreq).sort((a, b) => b[1] - a[1])
  const blueSorted = Object.entries(blueFreq).sort((a, b) => b[1] - a[1])

  const hot = [
    ...redSorted.slice(0, 6).map(([n, f]) => ({
      number: +n, frequency: f, probability: Math.round(60 + (f / total) * 40), type: 'red' as const,
    })),
    ...blueSorted.slice(0, 2).map(([n, f]) => ({
      number: +n, frequency: f, probability: Math.round(55 + (f / total) * 40), type: 'blue' as const,
    })),
  ]

  const cold = Object.entries({ ...redFreq, ...blueFreq })
    .filter(([, f]) => f <= 1)
    .slice(0, 5)
    .map(([n]) => ({
      number: +n,
      lastAppearance: redLast[+n] ?? blueLast[+n] ?? 99,
      probability: Math.round(30 + Math.random() * 25),
      type: (redLast[+n] !== undefined ? 'red' : 'blue') as 'red' | 'blue',
    }))

  const missed = Object.entries({ ...redLast, ...blueLast })
    .filter(([, la]) => la > 5)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([key, la]) => {
      const isRed = redLast[+key] !== undefined
      const maxMiss = Math.round(la * 1.3 + 5)
      return {
        number: +key,
        currentMiss: la,
        maxMiss,
        alert: (la > maxMiss * 0.8 ? 'high' : 'warn') as 'high' | 'warn',
        type: isRed ? ('red' as const) : ('blue' as const),
      }
    })

  return { hot, cold, missed }
}
