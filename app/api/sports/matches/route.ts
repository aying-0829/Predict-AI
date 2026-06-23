import { NextRequest } from 'next/server'
import { getRealCompletedMatches } from '@/lib/worldCupRealData'
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

  // 降级：使用真实世界杯数据构建 SportMatch
  const realMatches = getRealCompletedMatches()
  const todayStr = '2026-06-23'

  function buildSportMatch(m: typeof realMatches[0], idx: number): SportMatch {
    const homeScore = m.homeScore ?? 0
    const awayScore = m.awayScore ?? 0
    const winner = homeScore > awayScore ? 'home' as const : awayScore > homeScore ? 'away' as const : 'draw' as const
    const baseHome = 45 + ((idx * 7) % 15)
    const baseDraw = 20 + ((idx * 3) % 10)
    return {
      id: m.id,
      time: `${m.date.slice(5).replace(/-/g, '-')} ${m.time}`,
      league: `世界杯 ${m.group}组`,
      homeTeam: m.home,
      awayTeam: m.away,
      homeFlag: m.homeFlag,
      awayFlag: m.awayFlag,
      status: 'finished',
      homeScore,
      awayScore,
      aiPrediction: {
        winner,
        confidence: 60 + ((idx * 13) % 25),
        scorePrediction: `${homeScore}:${awayScore}`,
        bar: { home: baseHome, draw: baseDraw, away: 100 - baseHome - baseDraw },
      },
    }
  }

  let data: SportMatch[]

  if (filter === 'today') {
    const todayMatches = realMatches.filter(m => m.date === todayStr)
    if (todayMatches.length > 0) {
      data = todayMatches.map((m, i) => buildSportMatch(m, i))
    } else {
      // 没有今天比赛则用最近一场
      const sorted = [...realMatches].sort((a, b) => b.date.localeCompare(a.date))
      data = [buildSportMatch(sorted[0], 0)]
    }
  } else if (filter === 'league') {
    // 基于真实球队生成模拟联赛数据
    const leagueTeams = [
      { league: '英超', teams: [['加拿大','CA'],['英格兰','GB'],['荷兰','NL'],['德国','DE'],['法国','FR'],['西班牙','ES']] },
      { league: '西甲', teams: [['巴西','BR'],['阿根廷','AR'],['葡萄牙','PT'],['哥伦比亚','CO'],['乌拉圭','UY'],['摩洛哥','MA']] },
      { league: '德甲', teams: [['德国','DE'],['奥地利','AT'],['瑞士','CH'],['挪威','NO'],['瑞典','SE'],['比利时','BE']] },
      { league: '意甲', teams: [['日本','JP'],['韩国','KR'],['墨西哥','MX'],['美国','US'],['澳大利亚','AU'],['伊朗','IR']] },
    ]
    data = leagueTeams.flatMap((lg, li) => {
      const pairs: SportMatch[] = []
      for (let i = 0; i < Math.min(3, Math.floor(lg.teams.length / 2)); i++) {
        const h = lg.teams[i * 2]
        const a = lg.teams[i * 2 + 1]
        const idx = li * 10 + i
        pairs.push({
          id: `${lg.league.slice(0, 2).toLowerCase()}${idx + 1}`,
          time: '06-23 02:30',
          league: lg.league,
          homeTeam: h[0],
          awayTeam: a[0],
          homeFlag: h[1],
          awayFlag: a[1],
          status: 'upcoming',
          aiPrediction: {
            winner: idx % 3 === 0 ? 'home' : idx % 3 === 1 ? 'draw' : 'away',
            confidence: 55 + ((idx * 7) % 25),
            scorePrediction: `${(idx % 3) + 1}:${((idx + 1) % 3)}`,
            bar: { home: 40 + ((idx * 5) % 20), draw: 25 + ((idx * 3) % 15), away: 100 - (40 + ((idx * 5) % 20)) - (25 + ((idx * 3) % 15)) },
          },
        })
      }
      return pairs
    })
  } else if (filter === 'finished') {
    data = realMatches.map((m, i) => buildSportMatch(m, i))
  } else {
    data = realMatches.map((m, i) => buildSportMatch(m, i))
  }

  return Response.json({ code: 0, data })
}
