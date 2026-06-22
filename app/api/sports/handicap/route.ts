import { getHandicapData } from '@/lib/services'
import { fetchWorldCupGames, fetchSportScoreLive } from '@/lib/footballApi'

export const dynamic = 'force-dynamic'

export async function GET() {
  const data = getHandicapData()

  try {
    // 尝试获取真实比分，用于标注 handicap 条目中已开始/结束的比赛
    const [ssLive, wcGames] = await Promise.all([
      fetchSportScoreLive(),
      fetchWorldCupGames(),
    ])

    const scoreMap: Record<string, { homeScore: number; awayScore: number; status: string }> = {}

    if (ssLive && ssLive.length > 0) {
      for (const m of ssLive) {
        const home = (m as any).home_team_name || (m as any).home_team?.name || ''
        const away = (m as any).away_team_name || (m as any).away_team?.name || ''
        if (home && away) {
          scoreMap[`${home}|${away}`] = {
            homeScore: (m as any).home_score ?? 0,
            awayScore: (m as any).away_score ?? 0,
            status: (m as any).status || 'live',
          }
        }
      }
    }

    if (wcGames && wcGames.length > 0) {
      for (const m of wcGames) {
        const home = (m as any).home_team || (m as any).homeTeam || ''
        const away = (m as any).away_team || (m as any).awayTeam || ''
        const key = `${home}|${away}`
        if (home && away && !scoreMap[key]) {
          scoreMap[key] = {
            homeScore: (m as any).home_score ?? (m as any).homeScore ?? 0,
            awayScore: (m as any).away_score ?? (m as any).awayScore ?? 0,
            status: (m as any).status || 'upcoming',
          }
        }
      }
    }

    // 补充实时比分信息
    const enriched = data.map(item => {
      const key = `${item.homeTeam}|${item.awayTeam}`
      const score = scoreMap[key]
      if (score) {
        return {
          ...item,
          liveScore: { home: score.homeScore, away: score.awayScore },
          matchStatus: score.status,
        }
      }
      return item
    })

    return Response.json({
      code: 0,
      data: enriched,
      attribution: '<a href="https://sportscore.com">Powered by SportScore</a>',
    })
  } catch {
    // 降级
  }

  return Response.json({ code: 0, data })
}
