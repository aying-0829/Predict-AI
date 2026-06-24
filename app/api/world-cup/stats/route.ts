import { NextResponse } from 'next/server'
import { getRealTournamentStats, getRealTopScorers } from '@/lib/worldCupRealData'

export async function GET() {
  return NextResponse.json({
    stats: getRealTournamentStats(),
    scorers: getRealTopScorers(),
  })
}