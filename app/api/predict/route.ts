import { NextResponse } from 'next/server'
import { predictMatch, type SportMatchInput } from '@/lib/engine/sports'
import { fetchWorldCupGames, fetchSportScoreLive, normalizeMatch } from '@/lib/footballApi'
import { getDB } from '@/lib/db'
import { accuracyStats } from '@/lib/data'
import { getSportMatches, getWorldCupMatches, type SportMatch } from '@/lib/services'

export async function GET() {
  let matches: (SportMatch & { aiPrediction: { winner: string; confidence: number; scorePrediction: string; bar: { home: number; draw: number; away: number } } })[] = []

  try {
    const realMatches: SportMatch[] = []

    const wcGames = await fetchWorldCupGames()
    if (wcGames && wcGames.length > 0) {
      wcGames.forEach((raw, i) => {
        realMatches.push(normalizeMatch(raw, i))
      })
    }

    if (realMatches.length === 0) {
      const ssMatches = await fetchSportScoreLive()
      if (ssMatches && ssMatches.length > 0) {
        ssMatches.forEach((raw, i) => {
          realMatches.push(normalizeMatch(raw, i))
        })
      }
    }

    if (realMatches.length > 0) {
      matches = realMatches.map(m => {
        const input: SportMatchInput = {
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
        }
        const pred = predictMatch(input)
        return {
          ...m,
          aiPrediction: {
            winner: pred.winner,
            confidence: pred.confidence,
            scorePrediction: pred.scorePrediction,
            bar: pred.bar,
          },
        }
      })
    }
  } catch {
    // Fall through to static data
  }

  // Fallback: use services mock data with engine predictions
  if (matches.length === 0) {
    const sportMatches = getSportMatches()
    const wcMatches = getWorldCupMatches()

    const allMatches = [...wcMatches.slice(0, 4), ...sportMatches.slice(0, 4)]

    matches = allMatches.map(m => {
      const homeName = 'homeTeam' in m ? m.homeTeam : m.home
      const awayName = 'awayTeam' in m ? m.awayTeam : m.away
      const input: SportMatchInput = { homeTeam: homeName, awayTeam: awayName }
      const pred = predictMatch(input)

      const existingPred = 'aiPrediction' in m ? m.aiPrediction : null

      return {
        id: m.id,
        time: m.time,
        league: 'league' in m ? m.league : '',
        homeTeam: homeName,
        awayTeam: awayName,
        homeFlag: 'homeFlag' in m ? m.homeFlag : '',
        awayFlag: 'awayFlag' in m ? m.awayFlag : '',
        status: ('status' in m ? m.status : 'upcoming') as 'live' | 'upcoming' | 'finished',
        aiPrediction: {
          winner: pred.winner,
          confidence: pred.confidence,
          scorePrediction: pred.scorePrediction,
          bar: existingPred?.bar ?? pred.bar,
        },
      }
    })
  }

  // Dynamic accuracy from DB or fallback
  let accuracy = { ...accuracyStats }
  try {
    const db = getDB()
    const row = db.prepare(
      'SELECT SUM(total_predictions) as total_p, SUM(total_hits) as total_h FROM users'
    ).get() as { total_p: number; total_h: number } | undefined

    if (row && row.total_p > 0) {
      const overallAcc = Math.round((row.total_h / row.total_p) * 1000) / 10
      accuracy = {
        ...accuracyStats,
        worldCup: overallAcc,
        top5Leagues: overallAcc,
      }
    }
  } catch {
    // Use static accuracy
  }

  return NextResponse.json({
    success: true,
    matches: matches.map(m => ({
      id: m.id,
      time: m.time,
      league: m.league,
      homeTeam: m.homeTeam,
      awayTeam: m.awayTeam,
      homeFlag: m.homeFlag,
      awayFlag: m.awayFlag,
      status: m.status,
      homeScore: 'homeScore' in m ? m.homeScore : undefined,
      awayScore: 'awayScore' in m ? m.awayScore : undefined,
      aiPrediction: m.aiPrediction,
    })),
    accuracy,
    timestamp: new Date().toISOString(),
  })
}
