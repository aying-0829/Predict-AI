/**
 * Prediction Validation Engine
 *
 * Verifies lottery predictions against real draws and sports bets against
 * match results. Also recalculates user accuracy statistics.
 */

import { getDB } from '../db'
import { fetchLotteryHistory, type LotteryDraw } from '../lotteryApi'
import { fetchWorldCupGames, fetchSportScoreMatches } from '../footballApi'

// ── Helpers ──────────────────────────────────────────────────────────

interface ParsedNumbers {
  reds: number[]
  blues: number[]
}

function parsePredictionNumbers(numbers: string, _lotteryType: string): ParsedNumbers {
  // SSQ / DLT: "01,02,03,04,05,06|07" or "01,02,03,04,05|06,07"
  // 3D: "1,2,3"
  if (numbers.includes('|')) {
    const [redStr, blueStr] = numbers.split('|')
    return {
      reds: redStr.split(',').map(Number).filter(n => !isNaN(n)),
      blues: blueStr.split(',').map(Number).filter(n => !isNaN(n)),
    }
  }
  return {
    reds: numbers.split(',').map(Number).filter(n => !isNaN(n)),
    blues: [],
  }
}

function countHits(predicted: ParsedNumbers, actual: ParsedNumbers): number {
  const predSet = new Set(predicted.reds)
  let hits = 0
  actual.reds.forEach(n => {
    if (predSet.has(n)) hits++
  })
  // Blues: only count if both have blues
  if (predicted.blues.length > 0 && actual.blues.length > 0) {
    const predBlueSet = new Set(predicted.blues)
    actual.blues.forEach(n => {
      if (predBlueSet.has(n)) hits++
    })
  }
  return hits
}

// ── Lottery Verification ─────────────────────────────────────────────

export async function verifyLotteryDraw(lotteryType: string): Promise<{
  verified: number
  hits: number
  misses: number
}> {
  const db = getDB()

  // 1. Fetch latest draw from real API
  let latestDraw: LotteryDraw | null = null
  try {
    const draws = await fetchLotteryHistory(lotteryType as 'ssq' | 'dlt' | '3d', 1)
    if (draws && draws.length > 0) {
      latestDraw = draws[0]
    }
  } catch {
    // API unavailable — return empty result
  }

  if (!latestDraw) {
    return { verified: 0, hits: 0, misses: 0 }
  }

  const actualNumbers: ParsedNumbers = {
    reds: latestDraw.reds,
    blues: latestDraw.blues,
  }

  // 2. Find unverified predictions
  const unverified = db
    .prepare('SELECT id, numbers FROM predictions WHERE lottery_type = ? AND is_hit = 0')
    .all(lotteryType) as { id: number; numbers: string }[]

  if (unverified.length === 0) {
    return { verified: 0, hits: 0, misses: 0 }
  }

  // 3. Compare and update
  const updateStmt = db.prepare('UPDATE predictions SET is_hit = ?, hit = ? WHERE id = ?')
  let hits = 0
  let misses = 0

  const updateMany = db.transaction(() => {
    for (const row of unverified) {
      const predicted = parsePredictionNumbers(row.numbers, lotteryType)
      const hitCount = countHits(predicted, actualNumbers)
      const isHit = hitCount > 0 ? 1 : 0
      updateStmt.run(isHit, hitCount, row.id)
      if (isHit) hits++
      else misses++
    }
  })
  updateMany()

  return { verified: unverified.length, hits, misses }
}

// ── Sports Verification ──────────────────────────────────────────────

export async function verifySportsMatches(): Promise<{
  verified: number
  won: number
  lost: number
}> {
  const db = getDB()

  // 1. Fetch finished matches from real APIs
  interface FinishedMatch {
    id: string
    homeScore: number
    awayScore: number
  }
  const finishedMap = new Map<string, FinishedMatch>()

  try {
    const wcGames = await fetchWorldCupGames()
    if (wcGames) {
      for (const game of wcGames) {
        const status = (game.status || '').toLowerCase()
        const hs = game.home_score ?? game.homeScore ?? null
        const as = game.away_score ?? game.awayScore ?? null
        if (
          (status.includes('finish') || status.includes('ended') || status.includes('completed') || status.includes('ft')) &&
          hs !== null && hs !== undefined &&
          as !== null && as !== undefined
        ) {
          const matchId = game._id || `wc-${game.home_team || game.homeTeam}-${game.away_team || game.awayTeam}`
          finishedMap.set(String(matchId), {
            id: String(matchId),
            homeScore: Number(hs),
            awayScore: Number(as),
          })
        }
      }
    }
  } catch {
    // API unavailable
  }

  // Try SportScore as fallback
  if (finishedMap.size === 0) {
    try {
      const ssMatches = await fetchSportScoreMatches({ status: 'finished' })
      if (ssMatches) {
        for (const m of ssMatches) {
          const hs = m.home_score ?? null
          const as = m.away_score ?? null
          if (hs !== null && hs !== undefined && as !== null && as !== undefined) {
            const matchId = String(m.id || `${m.home_team_name}-${m.away_team_name}`)
            finishedMap.set(matchId, {
              id: matchId,
              homeScore: Number(hs),
              awayScore: Number(as),
            })
          }
        }
      }
    } catch {
      // API unavailable
    }
  }

  if (finishedMap.size === 0) {
    return { verified: 0, won: 0, lost: 0 }
  }

  // 2. Find unsettled bet slips
  const unsettled = db
    .prepare("SELECT id, match_id, pick FROM bet_slips WHERE won = 0")
    .all() as { id: number; match_id: string; pick: string }[]

  if (unsettled.length === 0) {
    return { verified: 0, won: 0, lost: 0 }
  }

  // 3. Compare and update
  const updateBet = db.prepare('UPDATE bet_slips SET won = ? WHERE id = ?')
  let won = 0
  let lost = 0

  const settleBets = db.transaction(() => {
    for (const bet of unsettled) {
      const match = finishedMap.get(bet.match_id)
      if (!match) continue

      let actualResult: 'home' | 'draw' | 'away'
      if (match.homeScore > match.awayScore) actualResult = 'home'
      else if (match.homeScore < match.awayScore) actualResult = 'away'
      else actualResult = 'draw'

      const betWon = bet.pick === actualResult ? 1 : 0
      updateBet.run(betWon, bet.id)
      if (betWon) won++
      else lost++
    }
  })
  settleBets()

  return { verified: unsettled.length, won, lost }
}

// ── Accuracy Recalculation ───────────────────────────────────────────

export async function recalculateAccuracy(userId?: number): Promise<{
  updated: number
  users: { userId: number; total_predictions: number; total_hits: number; current_streak: number; longest_streak: number }[]
}> {
  const db = getDB()

  // Determine which users to recalculate
  let userIds: number[]
  if (userId !== undefined) {
    userIds = [userId]
  } else {
    const allUsers = db.prepare('SELECT id FROM users').all() as { id: number }[]
    userIds = allUsers.map(u => u.id)
  }

  const results: {
    userId: number
    total_predictions: number
    total_hits: number
    current_streak: number
    longest_streak: number
  }[] = []

  const updateUser = db.prepare(
    'UPDATE users SET total_predictions = ?, total_hits = ?, current_streak = ?, longest_streak = ? WHERE id = ?'
  )

  const updateAll = db.transaction(() => {
    for (const uid of userIds) {
      // Aggregate stats from predictions
      const stats = db
        .prepare(
          'SELECT COUNT(*) as total, COALESCE(SUM(CASE WHEN is_hit = 1 THEN 1 ELSE 0 END), 0) as hits FROM predictions WHERE user_id = ?'
        )
        .get(uid) as { total: number; hits: number }

      // Calculate streaks from ordered prediction history
      const preds = db
        .prepare('SELECT is_hit FROM predictions WHERE user_id = ? ORDER BY created_at DESC')
        .all(uid) as { is_hit: number }[]

      // Current streak: consecutive is_hit=1 from the most recent
      let currentStreak = 0
      for (const p of preds) {
        if (p.is_hit === 1) currentStreak++
        else break
      }

      // Longest streak: longest consecutive run of is_hit=1
      let longestStreak = 0
      let run = 0
      for (const p of preds) {
        if (p.is_hit === 1) {
          run++
          if (run > longestStreak) longestStreak = run
        } else {
          run = 0
        }
      }

      updateUser.run(stats.total, stats.hits, currentStreak, longestStreak, uid)

      results.push({
        userId: uid,
        total_predictions: stats.total,
        total_hits: stats.hits,
        current_streak: currentStreak,
        longest_streak: longestStreak,
      })
    }
  })
  updateAll()

  return { updated: userIds.length, users: results }
}
