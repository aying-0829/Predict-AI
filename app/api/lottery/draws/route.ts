import { NextResponse } from 'next/server'
import { getLotteryData } from '@/lib/services'
import { fetchLotteryHistory, type LotteryType } from '@/lib/lotteryApi'

export async function GET() {
  try {
    const types: { type: LotteryType; id: string; name: string }[] = [
      { type: 'ssq', id: 'ssq001', name: '双色球' },
      { type: 'dlt', id: 'dlt001', name: '大乐透' },
    ]

    const results = await Promise.all(
      types.map(async (t) => {
        const list = await fetchLotteryHistory(t.type, 1)
        const draw = list?.[0]
        if (!draw) return null
        return {
          id: t.id,
          name: t.name,
          period: draw.period,
          date: draw.date,
          redBalls: draw.reds,
          blueBalls: draw.blues,
          aiRecommend: { red: [], blue: [] },
        }
      }),
    )

    const valid = results.filter(Boolean)
    if (valid.length > 0) {
      return NextResponse.json(valid)
    }
  } catch {
    // fallback to mock
  }

  return NextResponse.json(getLotteryData())
}
