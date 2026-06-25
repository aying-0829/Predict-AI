import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { fetchWorldCupGames, fetchAllTeams, fetchAllStadiums } from '@/lib/footballApi'

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
  let skipped = 0
  let errors = 0

  try {
    // 1. Fetch games from World Cup API
    const wcResp = await fetch('https://worldcup26.ir/get/games')
    const data = await wcResp.json()
    const games = (data.games || data.matches || []) as any[]
    console.log(`[sync-matches] Starting sync, fetched ${games.length} games from API`)

    // 2. Fetch teams & stadiums (with 24h cache)
    const teams = await fetchAllTeams()
    const stadiums = await fetchAllStadiums()

    // 3. Process each game
    for (const game of games) {
      try {
        const gameId = game.id || game._id || ''
        const sourceId = game._id || ''

        // Resolve team names: primary from cache by ID, fallback to API name_en
        const homeTeamId = String(game.home_team_id || '')
        const awayTeamId = String(game.away_team_id || '')
        const homeTeam = (teams.get(homeTeamId)?.name_en) || game.home_team_name_en || ''
        const awayTeam = (teams.get(awayTeamId)?.name_en) || game.away_team_name_en || ''

        if (!homeTeam || !awayTeam) {
          console.warn(
            `[sync-matches] Skipped game #${gameId}: missing team name (home:"${homeTeam}" away:"${awayTeam}")`
          )
          skipped++
          continue
        }

        // Resolve stadium from cache by stadium_id
        const stadiumId = String(game.stadium_id || '')
        const stadiumInfo = stadiums.get(stadiumId)
        const stadium = stadiumInfo?.name_en || ''
        const city = stadiumInfo ? `${stadiumInfo.city_en}, ${stadiumInfo.country_en}` : ''

        // Parse scores (API returns strings)
        const homeScore = parseInt(String(game.home_score), 10) || 0
        const awayScore = parseInt(String(game.away_score), 10) || 0

        // Parse date: "MM/DD/YYYY HH:mm" → YYYY-MM-DD + HH:mm
        let matchDate = ''
        let matchTime = ''
        if (game.local_date) {
          const [datePart, timePart] = game.local_date.split(' ')
          const [mm, dd, yyyy] = (datePart || '').split('/')
          if (yyyy && mm && dd) {
            matchDate = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
          }
          matchTime = timePart || ''
        }

        // Status mapping based on finished + time_elapsed
        let status = 'upcoming'
        const finished = String(game.finished || '').toUpperCase()
        const timeElapsed = String(game.time_elapsed || '').toLowerCase()

        if (finished === 'TRUE' || timeElapsed === 'finished') {
          status = 'finished'
        } else if (timeElapsed === 'notstarted') {
          status = 'upcoming'
        } else if (finished === 'FALSE' && timeElapsed && timeElapsed !== 'notstarted') {
          status = 'live'
        }

        // Parse minute (only meaningful for live matches)
        let minute: number | null = null
        if (timeElapsed && timeElapsed !== 'finished' && timeElapsed !== 'notstarted') {
          const parsed = parseInt(timeElapsed, 10)
          if (!isNaN(parsed)) minute = parsed
        }

        // Parse scorers (JSON strings like '{"Nestory Irankunda 27'"}' or "null")
        const homeScorers =
          game.home_scorers && game.home_scorers !== 'null' ? game.home_scorers : ''
        const awayScorers =
          game.away_scorers && game.away_scorers !== 'null' ? game.away_scorers : ''

        // Group & matchday
        const groupName = game.group || ''
        const matchday = parseInt(String(game.matchday), 10) || null

        // Team flags (FIFA codes from cached teams)
        const homeFlag = teams.get(homeTeamId)?.fifa_code || ''
        const awayFlag = teams.get(awayTeamId)?.fifa_code || ''

        // Upsert: check by source_id (MongoDB _id from API)
        const existing = db
          .prepare('SELECT id FROM matches WHERE source_id = ? AND source_id != ''')
          .get(sourceId) as { id: number } | undefined

        if (existing) {
          db.prepare(
            `UPDATE matches SET
              home_team = ?, away_team = ?,
              home_score = ?, away_score = ?,
              status = ?, match_date = ?, match_time = ?,
              group_name = ?, stadium = ?, city = ?,
              home_flag = ?, away_flag = ?, minute = ?,
              home_scorers = ?, away_scorers = ?,
              matchday = ?,
              updated_at = datetime('now','localtime')
            WHERE id = ?`
          ).run(
            homeTeam, awayTeam,
            homeScore, awayScore,
            status, matchDate, matchTime,
            groupName, stadium, city,
            homeFlag, awayFlag, minute,
            homeScorers, awayScorers,
            matchday,
            existing.id
          )
        } else {
          db.prepare(
            `INSERT INTO matches (
              source_id, home_team, away_team,
              home_score, away_score, status,
              match_date, match_time, group_name,
              stadium, city, home_flag, away_flag,
              minute, home_scorers, away_scorers,
              matchday
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).run(
            sourceId, homeTeam, awayTeam,
            homeScore, awayScore, status,
            matchDate, matchTime, groupName,
            stadium, city, homeFlag, awayFlag,
            minute, homeScorers, awayScorers,
            matchday
          )
        }

        console.log(
          `[sync-matches] Synced: ${homeTeam} ${homeScore}-${awayScore} ${awayTeam} (Group ${groupName}, Matchday ${matchday}, ${status})`
        )
        synced++
      } catch (e: any) {
        console.error(
          `[sync-matches] Parse error for game #${game.id || game._id}: ${e.message || e}`
        )
        errors++
      }
    }
  } catch (e: any) {
    console.error(`[sync-matches] API error: ${e.message || e}`)
    return NextResponse.json(
      { error: 'API fetch failed', detail: e.message },
      { status: 502 }
    )
  }

  console.log(
    `[sync-matches] Sync complete: ${synced} synced, ${skipped} skipped, ${errors} errors`
  )

  return NextResponse.json({
    success: true,
    synced,
    skipped,
    errors,
    timestamp: new Date().toISOString(),
  })
}
