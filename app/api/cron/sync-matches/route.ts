import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { fetchWorldCupGames, fetchWorldCupGroups } from '@/lib/footballApi'

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

  // 第一步：同步分组/球队标志
  try {
    const groups = await fetchWorldCupGroups()
    if (groups && groups.length > 0) {
      for (const g of groups) {
        const groupName = g.group || g.name || ''
        const teams = g.teams || g.standings || []
        for (const t of teams) {
          const teamName = t.name || t.team || ''
          const fifaCode = t.fifa_code || ''
          if (!teamName) continue
          db.prepare(
            "UPDATE matches SET home_flag = ? WHERE home_team = ? AND (home_flag IS NULL OR home_flag = '')"
          ).run(fifaCode, teamName)
          db.prepare(
            "UPDATE matches SET away_flag = ? WHERE away_team = ? AND (away_flag IS NULL OR away_flag = '')"
          ).run(fifaCode, teamName)
          db.prepare(
            "UPDATE matches SET group_name = ? WHERE (home_team = ? OR away_team = ?) AND (group_name IS NULL OR group_name = '')"
          ).run(groupName, teamName, teamName)
        }
      }
    }
  } catch {
    // groups API 失败，继续
  }

  // 第二步：从 World Cup API 获取赛果
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
        const groupName = game.group || ''
        const stadium = game.stadium || ''
        const minute = game.minute ?? null
        const status =
          game.status === 'finished' || game.status === 'FT'
            ? 'finished'
            : 'live'

        const existing = db.prepare(
          'SELECT id, home_score, away_score, status FROM matches WHERE home_team = ? AND away_team = ? AND match_date = ?'
        ).get(homeTeam, awayTeam, matchDate) as {
          id: number
          home_score: number | null
          away_score: number | null
          status: string
        } | undefined

        if (existing) {
          const prevHome = existing.home_score ?? 0
          const prevAway = existing.away_score ?? 0
          const prevTotal = prevHome + prevAway
          const newTotal = homeScore + awayScore
          const becameLive = existing.status !== 'live' && status === 'live'
          const scoreChanged = newTotal > prevTotal

          db.prepare(
            `UPDATE matches SET
              home_score = ?, away_score = ?, status = ?, minute = ?,
              group_name = CASE WHEN group_name = '' OR group_name IS NULL THEN ? ELSE group_name END,
              stadium = CASE WHEN stadium = '' OR stadium IS NULL THEN ? ELSE stadium END,
              updated_at = datetime('now','localtime')
            WHERE id = ?`
          ).run(homeScore, awayScore, status, minute, groupName, stadium, existing.id)

          // 进球事件
          if (scoreChanged && newTotal > 0) {
            const scoringTeam =
              homeScore > prevHome ? homeTeam : awayTeam
            db.prepare(
              'INSERT INTO match_events (match_id, event_type, minute, team, player_name, detail) VALUES (?, ?, ?, ?, ?, ?)'
            ).run(existing.id, 'goal', minute ?? 0, scoringTeam, '', '进球更新')
          }
        } else {
          db.prepare(
            'INSERT INTO matches (home_team, away_team, home_score, away_score, status, match_date, group_name, stadium, minute) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
          ).run(homeTeam, awayTeam, homeScore, awayScore, status, matchDate, groupName, stadium, minute)
        }
        synced++
      }
    }
  } catch {
    // World Cup API 失败
  }

  return NextResponse.json({
    success: true,
    synced,
    timestamp: new Date().toISOString(),
  })
}
