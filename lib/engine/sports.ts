/**
 * Sports Prediction Engine
 * ELO-based win probability + Poisson distribution score prediction.
 */

export interface SportMatchInput {
  homeTeam: string
  awayTeam: string
  homeElo?: number
  awayElo?: number
}

export interface SportPrediction {
  winner: 'home' | 'draw' | 'away'
  confidence: number
  scorePrediction: string
  bar: { home: number; draw: number; away: number }
  homeWinProb: number
  drawProb: number
  awayWinProb: number
  expectedGoals: { home: number; away: number }
}

// Poisson probability mass function
function poissonPMF(lambda: number, k: number): number {
  return Math.exp(-lambda) * Math.pow(lambda, k) / factorial(k)
}

function factorial(n: number): number {
  let r = 1
  for (let i = 2; i <= n; i++) r *= i
  return r
}

// ELO win expectancy
function eloWinProb(eloA: number, eloB: number): number {
  return 1 / (1 + Math.pow(10, (eloB - eloA) / 400))
}

/**
 * Predict match outcome using ELO + Poisson model.
 */
export function predictMatch(input: SportMatchInput): SportPrediction {
  const homeElo = input.homeElo ?? 1500
  const awayElo = input.awayElo ?? 1450

  // ELO-based win/draw/loss probabilities — ELO component reserved for future blend

  // Historical averages: home win ~46%, draw ~25%, away win ~29%
  // Adjust by ELO difference
  const baseHomeProb = 0.46
  const baseAwayProb = 0.29

  const eloDiff = (homeElo - awayElo) / 400
  const adjFactor = Math.tanh(eloDiff) * 0.15

  let homeWinProb = baseHomeProb + adjFactor
  let awayWinProb = baseAwayProb - adjFactor
  const drawProb = 1 - homeWinProb - awayWinProb

  // Normalize
  const total = homeWinProb + awayWinProb + drawProb
  homeWinProb /= total
  awayWinProb /= total

  // Expected goals (league avg ~1.4 per team)
  const baseGoals = 1.4
  const homeExpected = baseGoals + Math.tanh(eloDiff) * 0.6
  const awayExpected = baseGoals - Math.tanh(eloDiff) * 0.4

  // Poisson score distribution (up to 6 goals)
  let homeWinSum = 0, drawSum = 0, awayWinSum = 0
  for (let i = 0; i <= 6; i++) {
    for (let j = 0; j <= 6; j++) {
      const p = poissonPMF(homeExpected, i) * poissonPMF(awayExpected, j)
      if (i > j) homeWinSum += p
      else if (i === j) drawSum += p
      else awayWinSum += p
    }
  }
  const poissonTotal = homeWinSum + drawSum + awayWinSum
  const pHome = homeWinSum / poissonTotal
  const pDraw = drawSum / poissonTotal
  const pAway = awayWinSum / poissonTotal

  // Blend ELO and Poisson
  const finalHome = (homeWinProb * 0.5 + pHome * 0.5) * 100
  const finalDraw = (drawProb * 0.3 + pDraw * 0.7) * 100
  const finalAway = (awayWinProb * 0.5 + pAway * 0.5) * 100

  // Determine winner
  let winner: 'home' | 'draw' | 'away'
  if (finalHome > finalDraw && finalHome > finalAway) winner = 'home'
  else if (finalDraw > finalHome && finalDraw > finalAway) winner = 'draw'
  else winner = 'away'

  // Score prediction based on expected goals
  const hScore = Math.round(homeExpected * 100) / 100
  const aScore = Math.round(awayExpected * 100) / 100
  const hInt = Math.max(0, Math.round(homeExpected))
  const aInt = Math.max(0, Math.round(awayExpected))

  // Confidence based on largest probability
  const confidence = Math.round(Math.max(finalHome, finalDraw, finalAway))

  return {
    winner,
    confidence,
    scorePrediction: `${hInt}-${aInt}`,
    bar: {
      home: Math.round(finalHome),
      draw: Math.round(finalDraw),
      away: Math.round(finalAway),
    },
    homeWinProb: Math.round(finalHome * 10) / 10,
    drawProb: Math.round(finalDraw * 10) / 10,
    awayWinProb: Math.round(finalAway * 10) / 10,
    expectedGoals: { home: hScore, away: aScore },
  }
}
