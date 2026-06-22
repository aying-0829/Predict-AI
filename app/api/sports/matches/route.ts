import { NextRequest } from 'next/server'
import { getSportMatches } from '@/lib/services'
import {
  fetchWorldCupGames,
  fetchSportScoreLive,
  fetchSportScoreMatches,
  normalizeMatch,
  type WCMatchRaw,
  type SSMatchRaw,
} from '@/lib/footballApi'
import type { SportMatch } from '@/app/components/betting/MatchCard'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const filter = request.nextUrl.searchParams.get('filter') as 'today' | 'league' | 'finished' | undefined

  try {
    // ── 今日赛事：优先 SportScore live + World Cup ──
    if (filter === 'today') {
      const [ssLive, wcGames] = await Promise.all([
        fetchSportScoreLive(),
        fetchWorldCupGames(),
      ])
      const matches: SportMatch[] = []

      // SportScore 实时
      if (ssLive && ssLive.length > 0) {
        const liveMatches = ssLive
          .filter((m: SSMatchRaw) => {
            const s = (m.status || '').toLowerCase()
            return s.includes('live') || s.includes('ongoing') || s.includes('in_play')
          })
          .map((m: SSMatchRaw, i: number) => normalizeMatch(m, i))
        matches.push(...liveMatches)
      }

      // World Cup 补充
      if (wcGames && wcGames.length > 0) {
        const wcLive = wcGames
          .filter((m: WCMatchRaw) => {
            const s = (m.status || '').toLowerCase()
            return s.includes('live') || s.includes('ongoing')
          })
          .filter((m: WCMatchRaw) => !matches.some(existing =>
            existing.homeTeam === (m.home_team || m.homeTeam) &&
            existing.awayTeam === (m.away_team || m.awayTeam)
          ))
          .map((m: WCMatchRaw, i: number) => normalizeMatch(m, matches.length + i))
        matches.push(...wcLive)
      }

      if (matches.length > 0) {
        return Response.json({
          code: 0,
          data: matches,
          attribution: '<a href="https://sportscore.com">Powered by SportScore</a>',
        })
      }
      throw new Error('No live matches from API')
    }

    // ── 热门联赛：SportScore ──
    if (filter === 'league') {
      const leagues = ['premier-league', 'la-liga', 'bundesliga', 'serie-a']
      const results = await Promise.all(
        leagues.map(l => fetchSportScoreMatches({ league: l }))
      )

      const grouped: { league: string; matches: SportMatch[] }[] = []
      const leagueNames = ['英超', '西甲', '德甲', '意甲']

      results.forEach((data, idx) => {
        if (data && data.length > 0) {
          const normalized = data.slice(0, 4).map((m: SSMatchRaw, i: number) =>
            normalizeMatch(m, grouped.length * 10 + i)
          )
          grouped.push({ league: leagueNames[idx], matches: normalized })
        }
      })

      if (grouped.length > 0) {
        return Response.json({
          code: 0,
          data: grouped.flatMap(g => g.matches),
          attribution: '<a href="https://sportscore.com">Powered by SportScore</a>',
        })
      }
      throw new Error('No league matches from API')
    }

    // ── 已结束：World Cup + SportScore 最近 ──
    if (filter === 'finished') {
      const [wcGames, ssRecent] = await Promise.all([
        fetchWorldCupGames(),
        fetchSportScoreMatches({ status: 'finished', limit: '10' }),
      ])
      const matches: SportMatch[] = []

      if (wcGames && wcGames.length > 0) {
        const finished = wcGames
          .filter((m: WCMatchRaw) => {
            const s = (m.status || '').toLowerCase()
            return s.includes('finished') || s.includes('ended') || s.includes('completed') || s.includes('ft')
          })
          .map((m: WCMatchRaw, i: number) => normalizeMatch(m, i))
        matches.push(...finished)
      }

      if (ssRecent && ssRecent.length > 0) {
        const ssFinished = ssRecent
          .filter((m: SSMatchRaw) => {
            const s = (m.status || '').toLowerCase()
            return s.includes('finished') || s.includes('ended') || s.includes('completed')
          })
          .filter((m: SSMatchRaw) => !matches.some(existing =>
            existing.homeTeam === (m.home_team?.name || m.home_team_name) &&
            existing.awayTeam === (m.away_team?.name || m.away_team_name)
          ))
          .map((m: SSMatchRaw, i: number) => normalizeMatch(m, matches.length + i))
        matches.push(...ssFinished)
      }

      if (matches.length > 0) {
        return Response.json({
          code: 0,
          data: matches,
          attribution: '<a href="https://sportscore.com">Powered by SportScore</a>',
        })
      }
      throw new Error('No finished matches from API')
    }
  } catch {
    // 降级到 mock
  }

  // 降级：使用现有 mock 数据
  const data = getSportMatches(filter)
  return Response.json({ code: 0, data })
}
