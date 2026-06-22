import { NextRequest, NextResponse } from 'next/server'
import { getAIPredictions } from '@/lib/services'
import { getRealLotteryData, type RealDraw } from '@/lib/lotteryRealData'
import { analyzeHotCold, generateRecommendations } from '@/lib/engine/lottery'

function calcNextPeriod(latest: RealDraw, type: string): { current: string; next: string; currentDate: string; nextDate: string } {
  const latestNum = parseInt(latest.period)
  const currentNum = latestNum + 1
  const nextNum = latestNum + 2

  // DLT draw schedule: Mon/Wed/Sat; SSQ: Tue/Thu/Sun; 3D: daily
  const latestDate = new Date(latest.date)
  const getNextDrawDate = (from: Date, is3d: boolean): Date => {
    const d = new Date(from)
    d.setDate(d.getDate() + (is3d ? 1 : 1))
    // For SSQ/DLT skip to next valid draw day
    if (!is3d) {
      const day = d.getDay()
      if (type === 'ssq') {
        // SSQ: Tue(2), Thu(4), Sun(0)
        const validDays = [0, 2, 4]
        while (!validDays.includes(d.getDay())) d.setDate(d.getDate() + 1)
      } else if (type === 'dlt') {
        // DLT: Mon(1), Wed(3), Sat(6)
        const validDays = [1, 3, 6]
        let tries = 0
        while (!validDays.includes(d.getDay()) && tries < 7) { d.setDate(d.getDate() + 1); tries++ }
      }
    }
    return d
  }

  const currentDrawDate = getNextDrawDate(latestDate, type === '3d')
  const nextDrawDate = getNextDrawDate(currentDrawDate, type === '3d')

  return {
    current: String(currentNum),
    next: String(nextNum),
    currentDate: currentDrawDate.toISOString().slice(5, 10),
    nextDate: nextDrawDate.toISOString().slice(5, 10),
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') as 'ssq' | 'dlt' | '3d' | null

  if (!type || !['ssq', 'dlt', '3d'].includes(type)) {
    return NextResponse.json({ code: -1, message: 'Invalid type parameter' }, { status: 400 })
  }

  const config = {
    ssq: { redMax: 33, blueMax: 16, redCount: 6, blueCount: 1 },
    dlt: { redMax: 35, blueMax: 12, redCount: 5, blueCount: 2 },
    '3d': { redMax: 9, blueMax: 0, redCount: 3, blueCount: 0 },
  }[type]

  try {
    const draws = await getRealLotteryData(type, 50)
    if (draws && draws.length > 0) {
      const analysis = analyzeHotCold(draws, config.redMax, config.blueMax)
      const recommendations = generateRecommendations(analysis, config.redCount, config.blueCount)

      const current = recommendations[0]
      const next = recommendations[1] ?? recommendations[0]
      const periods = calcNextPeriod(draws[0], type)

      return NextResponse.json({
        code: 0,
        data: {
          type,
          analysis: {
            frequency: analysis.frequency,
            hotCold: analysis.hotCold,
            miss: analysis.miss,
            zoneDist: analysis.zoneDist,
            oddEven: analysis.oddEven,
          },
          recommendations: {
            current: {
              period: periods.current,
              date: periods.currentDate,
              reds: current.reds,
              blues: current.blues,
              numberProbabilities: [
                ...current.reds.map(n => ({ number: n, probability: current.confidence + Math.round(Math.random() * 15 - 5) })),
                ...current.blues.map(n => ({ number: n, probability: current.confidence - 5 + Math.round(Math.random() * 15) })),
              ],
              confidence: current.confidence,
              analysis: current.reasoning,
            },
            next: {
              period: periods.next,
              date: periods.nextDate,
              reds: next.reds,
              blues: next.blues,
              numberProbabilities: [
                ...next.reds.map(n => ({ number: n, probability: next.confidence + Math.round(Math.random() * 15 - 5) })),
                ...next.blues.map(n => ({ number: n, probability: next.confidence - 8 + Math.round(Math.random() * 15) })),
              ],
              confidence: next.confidence - 5,
              analysis: next.reasoning,
            },
          },
          disclaimer: 'AI 预测仅供娱乐参考，不构成投注建议。彩票开奖为独立随机事件，历史数据无法预测未来结果。',
        },
        source: '500.com',
      })
    }
  } catch (e) {
    console.error('Predictions API error:', e)
  }

  const mockData = getAIPredictions(type)
  return NextResponse.json({
    code: 0,
    data: {
      type,
      analysis: null,
      recommendations: mockData,
      disclaimer: 'AI 预测仅供娱乐参考，不构成投注建议。当前使用本地数据引擎。',
    },
    source: 'local',
  })
}
