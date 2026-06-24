import { NextResponse } from 'next/server'
import { getDB } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const db = getDB()

  const totalMatches = (db.prepare('SELECT COUNT(*) as cnt FROM matches').get() as any).cnt
  const completed = (db.prepare("SELECT COUNT(*) as cnt FROM matches WHERE status = 'finished'").get() as any).cnt

  const goalRow = db.prepare("SELECT SUM(home_score) as h, SUM(away_score) as a FROM matches WHERE status = 'finished'").get() as any
  const totalGoals = (goalRow.h || 0) + (goalRow.a || 0)
  const avgGoalsPerMatch = completed > 0 ? (totalGoals / completed).toFixed(2) : '0.00'

  const matches = db.prepare("SELECT * FROM matches WHERE status = 'finished'").all() as any[]
  let biggestWin = ''
  let maxDiff = -1
  for (const m of matches) {
    const diff = Math.abs((m.home_score || 0) - (m.away_score || 0))
    if (diff > maxDiff) { maxDiff = diff; biggestWin = `${m.home_team} ${m.home_score}-${m.away_score} ${m.away_team}` }
  }

  const teamGoals: Record<string, number> = {}
  for (const m of matches) {
    teamGoals[m.home_team] = (teamGoals[m.home_team] || 0) + (m.home_score || 0)
    teamGoals[m.away_team] = (teamGoals[m.away_team] || 0) + (m.away_score || 0)
  }
  const mostGoalsTeam = Object.entries(teamGoals).sort((a, b) => b[1] - a[1])[0]
  const mostGoals = mostGoalsTeam ? `${mostGoalsTeam[0]} (${mostGoalsTeam[1]})` : ''

  const teamConceded: Record<string, number> = {}
  for (const m of matches) {
    teamConceded[m.home_team] = (teamConceded[m.home_team] || 0) + (m.away_score || 0)
    teamConceded[m.away_team] = (teamConceded[m.away_team] || 0) + (m.home_score || 0)
  }
  const cleanSheets = Object.entries(teamConceded)
    .filter(([, c]) => c === 0)
    .map(([t]) => t).join(',')

  const scorers: Record<string, number> = {}

  return NextResponse.json({
    stats: { totalMatches, completed, totalGoals, avgGoalsPerMatch, biggestWin, mostGoals, cleanSheets },
    scorers,
  })
}
