import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { fetchWorldCupGames, fetchSportScoreLive } from '@/lib/footballApi'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth =
    new URL(request.url).searchParams.get('token') ||
    request.headers.get('Authorization')?.replace('Bearer ', '')

  if (auth !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getDB()
  let synced = 0

  // 第一步：从 World Cup API 获取赛果
  try {
    const wcGames = await fetchWorldCupGames()
    if (wcGames && wcGames.length > 0) {
      for (const game of wcGames) {
        if (game.home_score == null || game.away_score == null) continue
        const homeTeam = game.home_team || game.homeTeam || ''
        const awayTeam = game.away_team || game.awayTeam || ''
        if (!homeTeam || !awayTeam) continue

        const homeScore = Number(game.home_score)
        const awayScore = Number(game.away_score)
        const matchDate = game.date || ''
        const status = game.status === 'finished' || game.status === 'FT' || (homeScore !== 0 || awayScore !== 0) ? 'finished' : 'live'

        // UPSERT：按 home_team + away_team + match_date 匹配
        const existing = db.prepare(
          'SELECT id FROM matches WHERE home_team = ? AND away_team = ? AND match_date = ?'
        ).get(homeTeam, awayTeam, matchDate) as { id: number } | undefined

        if (existing) {
          db.prepare(
            'UPDATE matches SET home_score = ?, away_score = ?, status = ?, updated_at = datetime(\'now\',\'localtime\') WHERE id = ?'
          ).run(homeScore, awayScore, status, existing.id)
        } else {
          db.prepare(
            'INSERT INTO matches (home_team, away_team, home_score, away_score, status, match_date) VALUES (?, ?, ?, ?, ?, ?)'
          ).run(homeTeam, awayTeam, homeScore, awayScore, status, matchDate)
        }
        synced++
      }
    }
  } catch {
    // World Cup API 失败，降级
  }

  // 第二步：降级到 SportScore API
  if (synced === 0) {
    try {
      const ssLive = await fetchSportScoreLive()
      if (ssLive && ssLive.length > 0) {
        for (const match of ssLive) {
          if (match.home_score == null || match.away_score == null) continue
          // SportScore 字段映射
          const homeTeam = (match as any).home_team || (match as any).homeTeam || ''
          const awayTeam = (match as any).away_team || (match as any).awayTeam || ''
          if (!homeTeam || !awayTeam) continue

          const homeScore = Number(match.home_score)
          const awayScore = Number(match.away_score)
          const matchDate = (match as any).date || (match as any).match_date || ''
          const status = (match as any).status === 'FT' || (match as any).status === 'finished' ? 'finished' : 'live'

          const existing = db.prepare(
            'SELECT id FROM matches WHERE home_team = ? AND away_team = ? AND match_date = ?'
          ).get(homeTeam, awayTeam, matchDate) as { id: number } | undefined

          if (existing) {
            db.prepare(
              'UPDATE matches SET home_score = ?, away_score = ?, status = ?, updated_at = datetime(\'now\',\'localtime\') WHERE id = ?'
            ).run(homeScore, awayScore, status, existing.id)
          } else {
            db.prepare(
              'INSERT INTO matches (home_team, away_team, home_score, away_score, status, match_date) VALUES (?, ?, ?, ?, ?, ?)'
            ).run(homeTeam, awayTeam, homeScore, awayScore, status, matchDate)
          }
          synced++
        }
      }
    } catch {
      // SportScore API 失败
    }
  }

  return NextResponse.json({
    success: true,
    synced,
    timestamp: new Date().toISOString(),
  })
}
