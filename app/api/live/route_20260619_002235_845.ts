import { NextResponse } from 'next/server'
import { getLiveMatch } from '@/lib/services'
import {
  fetchWorldCupGames,
  fetchSportScoreLive,
  normalizeMatch,
  type WCMatchRaw,
  type SSMatchRaw,
} from '@/lib/footballApi'

// 基于真实球队和球员的赛事事件生成
const PLAYER_POOLS: Record<string, string[]> = {
  'Argentina': ['Messi', 'Alvarez', 'Di Maria', 'De Paul', 'Enzo Fernandez', 'Mac Allister'],
  'Brazil': ['Vinicius Jr', 'Rodrygo', 'Endrick', 'Paqueta', 'Casemiro', 'Raphinha'],
  'France': ['Mbappe', 'Griezmann', 'Dembele', 'Tchouameni', 'Kolo Muani', 'Camavinga'],
  'England': ['Kane', 'Bellingham', 'Foden', 'Rice', 'Saka', 'Palmer'],
  'Germany': ['Musiala', 'Wirtz', 'Havertz', 'Kimmich', 'Gundogan', 'Sane'],
  'Spain': ['Lamine Yamal', 'Nico Williams', 'Pedri', 'Gavi', 'Rodri', 'Olmo'],
  'Portugal': ['Cristiano Ronaldo', 'Bruno Fernandes', 'Bernardo Silva', 'Leao', 'Vitinha', 'Jota'],
  'Italy': ['Barella', 'Chiesa', 'Donnarumma', 'Bastoni', 'Tonali', 'Scalvini'],
  'Netherlands': ['Van Dijk', 'De Jong', 'Gakpo', 'Depay', 'Dumfries', 'Ake'],
  'Morocco': ['Hakimi', 'En-Nesyri', 'Ziyech', 'Amrabat', 'Boufal', 'Mazraoui'],
  'Japan': ['Mitoma', 'Kubo', 'Doan', 'Endo', 'Tomiyasu', 'Minamino'],
  'USA': ['Pulisic', 'McKennie', 'Reyna', 'Dest', 'Adams', 'Weah'],
  'Mexico': ['Raul Jimenez', 'Lozano', 'Alvarez', 'Ochoa', 'Montes', 'Sanchez'],
  'Uruguay': ['Valverde', 'Nunez', 'Araujo', 'Bentancur', 'Ugarte', 'Pellistri'],
  'Senegal': ['Mane', 'Jackson', 'Diallo', 'Koulibaly', 'Sarr', 'Mendy'],
}

function pickPlayer(teamName: string): string {
  const key = Object.keys(PLAYER_POOLS).find(k => teamName.toLowerCase().includes(k.toLowerCase()))
  const pool = key ? PLAYER_POOLS[key] : PLAYER_POOLS['Argentina']
  return pool[Math.floor(Math.random() * pool.length)]
}

function generateLiveEvents(homeTeam: string, awayTeam: string, homeScore: number, awayScore: number) {
  const events: { minute: string; type: string; description: string; side: 'home' | 'away' }[] = []
  const totalMinutes = 90 + Math.floor(Math.random() * 8)
  const goals = homeScore + awayScore

  // 生成进球事件
  const goalMinutes: number[] = []
  for (let i = 0; i < goals; i++) {
    goalMinutes.push(Math.floor(Math.random() * totalMinutes) + 1)
  }
  goalMinutes.sort((a, b) => a - b)

  let hGoals = 0
  let aGoals = 0
  for (const min of goalMinutes) {
    const isHome = hGoals < homeScore && (aGoals >= awayScore || Math.random() > 0.5)
    if (isHome) {
      hGoals++
      events.push({
        minute: `${min}'`,
        type: 'goal',
        description: `⚽ ${pickPlayer(homeTeam)} 破门得分！${homeTeam} ${hGoals}-${aGoals} ${awayTeam}`,
        side: 'home',
      })
    } else {
      aGoals++
      events.push({
        minute: `${min}'`,
        type: 'goal',
        description: `⚽ ${pickPlayer(awayTeam)} 破门得分！${homeTeam} ${hGoals}-${aGoals} ${awayTeam}`,
        side: 'away',
      })
    }
  }

  // 黄牌 (随机 1-3 张)
  const yellows = Math.floor(Math.random() * 4) + 1
  for (let i = 0; i < yellows; i++) {
    const side = (Math.random() > 0.5 ? 'home' : 'away') as 'home' | 'away'
    const team = side === 'home' ? homeTeam : awayTeam
    const min = Math.floor(Math.random() * totalMinutes) + 1
    events.push({
      minute: `${min}'`,
      type: 'yellow',
      description: `🟨 ${pickPlayer(team)} 被出示黄牌`,
      side,
    })
  }

  // 换人 (随机 2-5 次)
  const subs = Math.floor(Math.random() * 4) + 2
  for (let i = 0; i < subs; i++) {
    const side = (Math.random() > 0.5 ? 'home' : 'away') as 'home' | 'away'
    const team = side === 'home' ? homeTeam : awayTeam
    const min = Math.floor(Math.random() * totalMinutes) + 1
    events.push({
      minute: `${min}'`,
      type: 'sub',
      description: `🔄 ${team} 换人调整`,
      side,
    })
  }

  events.sort((a, b) => {
    const aMin = parseInt(a.minute)
    const bMin = parseInt(b.minute)
    return aMin - bMin
  })

  return events
}

export async function GET() {
  try {
    // 优先尝试 SportScore 实时数据
    const ssLive = await fetchSportScoreLive()
    const wcGames = await fetchWorldCupGames()

    let liveMatches: any[] = []

    if (ssLive && ssLive.length > 0) {
      const liveGames = ssLive.filter((m: SSMatchRaw) => {
        const s = (m.status || '').toLowerCase()
        return s.includes('live') || s.includes('ongoing') || s.includes('in_play')
      })

      for (const m of liveGames) {
        const homeTeam = (m as any).home_team_name || (m as any).home_team?.name || 'Home'
        const awayTeam = (m as any).away_team_name || (m as any).away_team?.name || 'Away'
        const homeScore = (m as any).home_score ?? (m as any).homeScore ?? 0
        const awayScore = (m as any).away_score ?? (m as any).awayScore ?? 0
        const minute = (m as any).minute || (m as any).minutes_played || 45

        liveMatches.push({
          homeTeam,
          awayTeam,
          homeScore: Number(homeScore),
          awayScore: Number(awayScore),
          minute: Number(minute),
          league: (m as any).league_name || (m as any).league?.name || '',
          status: 'live',
          events: generateLiveEvents(homeTeam, awayTeam, Number(homeScore), Number(awayScore)),
        })
      }
    }

    if (liveMatches.length === 0 && wcGames && wcGames.length > 0) {
      const liveGames = wcGames.filter((m: WCMatchRaw) => {
        const s = (m.status || '').toLowerCase()
        return s.includes('live') || s.includes('ongoing')
      })

      for (const m of liveGames) {
        const homeTeam = (m as any).home_team || (m as any).homeTeam || 'Home'
        const awayTeam = (m as any).away_team || (m as any).awayTeam || 'Away'
        const homeScore = (m as any).home_score ?? (m as any).homeScore ?? 0
        const awayScore = (m as any).away_score ?? (m as any).awayScore ?? 0
        const minute = (m as any).minute || 45

        liveMatches.push({
          homeTeam,
          awayTeam,
          homeScore: Number(homeScore),
          awayScore: Number(awayScore),
          minute: Number(minute),
          league: 'World Cup 2026',
          status: 'live',
          events: generateLiveEvents(homeTeam, awayTeam, Number(homeScore), Number(awayScore)),
        })
      }
    }

    if (liveMatches.length > 0) {
      return NextResponse.json({
        code: 0,
        data: liveMatches,
        source: 'sportscore.com / worldcup26.ir',
        attribution: '<a href="https://sportscore.com">Powered by SportScore</a>',
      })
    }
  } catch {
    // 降级
  }

  // 兜底：返回 mock 直播数据
  const mockMatch = getLiveMatch() as any
  if (mockMatch) {
    return NextResponse.json({
      code: 0,
      data: [{
        homeTeam: mockMatch.home || mockMatch.homeTeam || 'Brazil',
        awayTeam: mockMatch.away || mockMatch.awayTeam || 'Argentina',
        homeScore: Math.floor(Math.random() * 3),
        awayScore: Math.floor(Math.random() * 2),
        minute: Math.floor(Math.random() * 70) + 10,
        league: mockMatch.league || 'World Cup',
        status: 'live',
        events: generateLiveEvents(
          mockMatch.home || mockMatch.homeTeam || 'Brazil',
          mockMatch.away || mockMatch.awayTeam || 'Argentina',
          1, 0
        ),
      }],
      source: 'mock',
    })
  }

  return NextResponse.json({ code: 0, data: [], source: 'mock' })
}
