import { NextResponse } from 'next/server'
import { getTournamentStats, getTopScorers } from '@/lib/services'

export async function GET() {
  return NextResponse.json({
    stats: getTournamentStats(),
    scorers: getTopScorers(),
  })
}
