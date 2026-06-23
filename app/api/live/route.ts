import { NextResponse } from 'next/server'
import { getRealCompletedMatches } from '@/lib/worldCupRealData'
import {
  fetchWorldCupGames,
  fetchSportScoreLive,
  type WCMatchRaw,
  type SSMatchRaw,
} from '@/lib/footballApi'

export async function GET() {
  try {
    const [ssLive, wcGames] = await Promise.all([
      fetchSportScoreLive(),
      fetchWorldCupGames(),
    ])

    // 优先返回一场正在进行的比赛
    let liveMatch = null

    if (ssLive && ssLive.length > 0) {
      const liveGames = ssLive.filter((m: SSMatchRaw) => {
        const s = (m.status || '').toLowerCase()
        return s.includes('live') || s.includes('ongoing') || s.includes('in_play')
      })
      if (liveGames.length > 0) {
        const m = liveGames[0]
        liveMatch = {
          homeTeam: (m as any).home_team_name || (m as any).home_team?.name || 'Home',
          awayTeam: (m as any).away_team_name || (m as any).away_team?.name || 'Away',
          homeScore: (m as any).home_score ?? (m as any).homeScore ?? 0,
          awayScore: (m as any).away_score ?? (m as any).awayScore ?? 0,
          minute: (m as any).minute || (m as any).minutes_played || 45,
          league: (m as any).league_name || (m as any).league?.name || '',
          status: (m as any).status || 'live',
        }
      }
    }

    if (!liveMatch && wcGames && wcGames.length > 0) {
      const liveGames = wcGames.filter((m: WCMatchRaw) => {
        const s = (m.status || '').toLowerCase()
        return s.includes('live') || s.includes('ongoing')
      })
      if (liveGames.length > 0) {
        const m = liveGames[0]
        liveMatch = {
          homeTeam: (m as any).home_team || (m as any).homeTeam || 'Home',
          awayTeam: (m as any).away_team || (m as any).awayTeam || 'Away',
          homeScore: (m as any).home_score ?? (m as any).homeScore ?? 0,
          awayScore: (m as any).away_score ?? (m as any).awayScore ?? 0,
          minute: (m as any).minute || (m as any).minutes_played || 45,
          league: 'World Cup',
          status: (m as any).status || 'live',
        }
      }
    }

    if (liveMatch) {
      return NextResponse.json({
        code: 0,
        data: [liveMatch],
        attribution: '<a href="https://sportscore.com">Powered by SportScore</a>',
      })
    }
  } catch {
    // fallback
  }

  // 降级：使用真实世界杯已完赛比赛的最近一场
  const completedMatches = getRealCompletedMatches()
  if (completedMatches.length > 0) {
    const latest = completedMatches[completedMatches.length - 1]
    return NextResponse.json({
      code: 0,
      data: {
        id: latest.id,
        time: `${latest.date.slice(5).replace(/-/g, '-')} ${latest.time}`,
        league: '世界杯',
        group: `${latest.group}组`,
        home: latest.home,
        homeFlag: latest.homeFlag,
        away: latest.away,
        awayFlag: latest.awayFlag,
        homeWin: 0,
        draw: 0,
        awayWin: 0,
        aiScore: `${latest.homeScore ?? '-'}:${latest.awayScore ?? '-'}`,
      },
    })
  }

  return NextResponse.json({ code: 0, data: null })
}
