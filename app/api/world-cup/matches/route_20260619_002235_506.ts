import { NextResponse } from 'next/server'
import { getWorldCupMatches } from '@/lib/services'
import { fetchWorldCupGames, normalizeMatch, fetchSportScoreMatches } from '@/lib/footballApi'

export async function GET() {
  try {
    // 优先从 World Cup 2026 API 拉取真实数据
    const wcGames = await fetchWorldCupGames()

    if (wcGames && wcGames.length > 0) {
      const matches = wcGames.map((raw, i) => normalizeMatch(raw, i))

      return NextResponse.json({
        code: 0,
        data: matches,
        source: 'worldcup26.ir',
      })
    }

    // 降级：尝试 SportScore API
    const ssMatches = await fetchSportScoreMatches({ per_page: '64' })
    if (ssMatches && ssMatches.length > 0) {
      const matches = ssMatches.map((raw, i) => normalizeMatch(raw, i))
      return NextResponse.json({
        code: 0,
        data: matches,
        source: 'sportscore.com',
        attribution: '<a href="https://sportscore.com">Powered by SportScore</a>',
      })
    }
  } catch {
    // API 不可用，降级到 mock
  }

  // 兜底：返回 mock 数据（已在 data.ts 中预置真实球队名）
  return NextResponse.json({ code: 0, data: getWorldCupMatches(), source: 'mock' })
}
