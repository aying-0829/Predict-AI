import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { getTodayRecommendations } from '@/lib/services'
import { fetchLotteryHistory, type LotteryType, type LotteryDraw } from '@/lib/lotteryApi'

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')

  try {
    const [ssqDraws, dltDraws] = await Promise.all([
      fetchLotteryHistory('ssq' as LotteryType, 50),
      fetchLotteryHistory('dlt' as LotteryType, 50),
    ])

    const recommendations: { type: string; label: string; numbers: { reds: number[]; blue: number | number[] }; confidence: number; tags: string[] }[] = []

    if (ssqDraws && ssqDraws.length > 0) {
      const reds = computeHotReds(ssqDraws, 33, 6)
      const blue = computeHotBlue(ssqDraws, 16)
      recommendations.push({
        type: 'ssq',
        label: '双色球',
        numbers: { reds, blue },
        confidence: Math.round(65 + Math.random() * 15),
        tags: [] as string[],
      })
    }

    if (dltDraws && dltDraws.length > 0) {
      const reds = computeHotReds(dltDraws, 35, 5)
      const blues = computeHotBlues(dltDraws, 12, 2)
      recommendations.push({
        type: 'dlt',
        label: '大乐透',
        numbers: { reds, blue: blues },
        confidence: Math.round(60 + Math.random() * 15),
        tags: [] as string[],
      })
    }

    // 个性化标签：基于用户历史偏好
    if (userId && recommendations.length > 0) {
      try {
        const db = getDB()
        const uid = parseInt(userId) || 0
        // 获取用户最常预测的彩票类型
        const favRow = db.prepare(
          `SELECT lottery_type, COUNT(*) as cnt
           FROM predictions WHERE user_id = ?
           GROUP BY lottery_type ORDER BY cnt DESC LIMIT 1`
        ).get(uid) as { lottery_type: string; cnt: number } | undefined

        if (favRow && favRow.cnt >= 3) {
          const typeMap: Record<string, string> = { ssq: '双色球', dlt: '大乐透', '3d': '福彩3D', pl5: '排列五' }
          const favLabel = typeMap[favRow.lottery_type] || favRow.lottery_type
          // 在所有推荐上打标签
          recommendations.forEach(r => {
            if (!r.tags) r.tags = []
            r.tags.push(`因为你常看${favLabel}`)
          })
        }

        // 获取用户最常预测的时间段
        const timeRow = db.prepare(
          `SELECT strftime('%H', created_at) as hour, COUNT(*) as cnt
           FROM predictions WHERE user_id = ?
           GROUP BY strftime('%H', created_at) ORDER BY cnt DESC LIMIT 1`
        ).get(uid) as { hour: string; cnt: number } | undefined

        if (timeRow && timeRow.cnt >= 2) {
          const h = parseInt(timeRow.hour)
          const timeLabel = h < 6 ? '夜猫子时段' : h < 12 ? '上午时段' : h < 18 ? '下午时段' : '晚间时段'
          recommendations.forEach(r => {
            if (!r.tags) r.tags = []
            if (!r.tags.some((t: string) => t.includes(timeLabel))) {
              r.tags.push(`你的${timeLabel}专属`)
            }
          })
        }
      } catch {
        // DB query failed — silently skip personalization
      }
    }

    if (recommendations.length > 0) {
      return NextResponse.json({ code: 0, data: recommendations, source: 'real' })
    }
  } catch {
    // fallback
  }

  return NextResponse.json({ code: 0, data: getTodayRecommendations(), source: 'mock' })
}

function computeHotReds(draws: LotteryDraw[], max: number, count: number): number[] {
  const freq: Record<number, number> = {}
  for (let i = 1; i <= max; i++) freq[i] = 0
  draws.forEach(d => d.reds.forEach(n => { if (freq[n] !== undefined) freq[n]++ }))
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([n]) => +n)
    .sort((a, b) => a - b)
}

function computeHotBlue(draws: LotteryDraw[], max: number): number {
  const freq: Record<number, number> = {}
  for (let i = 1; i <= max; i++) freq[i] = 0
  draws.forEach(d => d.blues.forEach(n => { if (freq[n] !== undefined) freq[n]++ }))
  return +Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]
}

function computeHotBlues(draws: LotteryDraw[], max: number, count: number): number[] {
  const freq: Record<number, number> = {}
  for (let i = 1; i <= max; i++) freq[i] = 0
  draws.forEach(d => d.blues.forEach(n => { if (freq[n] !== undefined) freq[n]++ }))
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([n]) => +n)
    .sort((a, b) => a - b)
}
