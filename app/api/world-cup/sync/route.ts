import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface RawGame {
  _id: string
  id: number
  home_team_name_en: string
  away_team_name_en: string
  local_date: string
  home_score: number
  away_score: number
  home_scorers?: string[] | string
  away_scorers?: string[] | string
  group?: string
  stadium_id?: number
  finished?: boolean | string
  matchday?: number
  time_elapsed?: string | number
  type?: string
}

interface RawStadium {
  _id: number
  id: number
  name_en: string
  name_fa: string
  group?: string
}

function parseDate(d: string): { date: string; time: string } {
  const parts = d.split(' ')
  const datePart = parts[0] || ''
  const timePart = parts[1] || ''
  const dateBits = datePart.split('/')
  if (dateBits.length === 3) {
    return {
      date: `${dateBits[2]}-${dateBits[0].padStart(2, '0')}-${dateBits[1].padStart(2, '0')}`,
      time: timePart,
    }
  }
  return { date: datePart, time: timePart }
}

function parseScorers(raw: unknown): string {
  if (!raw) return ''
  if (typeof raw === 'string') {
    if (raw === 'null' || raw === '[]' || raw === '') return ''
    return raw
  }
  if (Array.isArray(raw)) {
    return raw.filter((s) => typeof s === 'string' && s.length > 0).join(',')
  }
  return ''
}

function safeStatus(finished: boolean | string | undefined, timeElapsed: string | number | undefined): string {
  if (finished === true || finished === 'true' || finished === 'TRUE' || finished === 1) return 'finished'
  if (timeElapsed !== undefined && timeElapsed !== null && timeElapsed !== 'finished' && timeElapsed !== 'notstarted' && String(timeElapsed) !== '') {
    return 'live'
  }
  return 'scheduled'
}

export async function GET() {
  const db = getDB()

  // 1. Fetch games from worldcup26.ir
  let games: RawGame[] = []
  try {
    const gamesRes = await fetch('https://worldcup26.ir/api/games', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000),
    })
    if (gamesRes.ok) {
      const data = await gamesRes.json()
      games = Array.isArray(data) ? data : (data.games || data.data || [])
    }
  } catch (e) {
    console.error('[sync] Failed to fetch games:', e)
  }

  // 2. Fetch stadiums
  let stadiumMap: Record<number, string> = {}
  try {
    const stadRes = await fetch('https://worldcup26.ir/api/stadiums', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000),
    })
    if (stadRes.ok) {
      const stadData = await stadRes.json()
      const stadiums: RawStadium[] = Array.isArray(stadData) ? stadData : (stadData.stadiums || [])
      for (const s of stadiums) {
        const sid = s.id ?? s._id
        if (sid) {
          stadiumMap[sid] = s.name_en || s.name_fa || ''
        }
      }
    }
  } catch (e) {
    console.error('[sync] Failed to fetch stadiums:', e)
  }

  // 3. Upsert into wc_matches
  let inserted = 0
  let updated = 0

  const upsert = db.prepare(`
    INSERT INTO wc_matches (
      source_id, home_team, away_team, home_score, away_score,
      home_scorers, away_scorers, status, group_name, stadium,
      match_date, match_time, time_elapsed, matchday, match_type, finished
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(source_id) DO UPDATE SET
      home_team = excluded.home_team,
      away_team = excluded.away_team,
      home_score = excluded.home_score,
      away_score = excluded.away_score,
      home_scorers = excluded.home_scorers,
      away_scorers = excluded.away_scorers,
      status = excluded.status,
      group_name = excluded.group_name,
      stadium = excluded.stadium,
      match_date = excluded.match_date,
      match_time = excluded.match_time,
      time_elapsed = excluded.time_elapsed,
      matchday = excluded.matchday,
      match_type = excluded.match_type,
      finished = excluded.finished,
      updated_at = datetime('now','localtime')
  `)

  const insertAll = db.transaction(() => {
    for (const g of games) {
      // Skip placeholder knockout matches with no teams
      if (!g.home_team_name_en || !g.away_team_name_en) continue
      if (g.home_team_name_en === 'Winner' || g.away_team_name_en === 'Winner') continue
      if (g.home_team_name_en.includes('Winner') || g.away_team_name_en.includes('Winner')) continue

      const sourceId = g.id || parseInt(g._id) || 0
      if (!sourceId) continue

      const { date, time } = parseDate(g.local_date || '')
      const finishedFlag = g.finished === true || g.finished === 'true' || g.finished === 'TRUE' || g.finished === 1 ? 1 : 0
      const status = safeStatus(g.finished, g.time_elapsed)
      const stadiumName = (g.stadium_id && stadiumMap[g.stadium_id]) ? stadiumMap[g.stadium_id] : ''
      const timeElapsed = g.time_elapsed !== undefined && g.time_elapsed !== null ? String(g.time_elapsed) : ''

      const result = upsert.run(
        sourceId,
        g.home_team_name_en,
        g.away_team_name_en,
        g.home_score ?? null,
        g.away_score ?? null,
        parseScorers(g.home_scorers),
        parseScorers(g.away_scorers),
        status,
        g.group || '',
        stadiumName,
        date,
        time,
        timeElapsed,
        g.matchday ?? null,
        g.type || 'group',
        finishedFlag,
      )
      if (result.changes > 0) {
        if (db.prepare('SELECT id FROM wc_matches WHERE source_id = ?').get(sourceId)) {
          // Already existed — this was an update
        } else {
          inserted++
        }
      }
    }
  })

  // Count accurately
  const countBefore = (db.prepare('SELECT COUNT(*) as cnt FROM wc_matches').get() as { cnt: number }).cnt
  insertAll()
  const countAfter = (db.prepare('SELECT COUNT(*) as cnt FROM wc_matches').get() as { cnt: number }).cnt
  inserted = Math.max(0, countAfter - countBefore)

  return NextResponse.json({
    code: 0,
    message: `Sync complete: ${inserted} inserted, ${updated} updated, ${countAfter} total in DB`,
    total: countAfter,
    inserted,
    updated,
  })
}
