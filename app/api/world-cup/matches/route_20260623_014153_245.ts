import { NextResponse } from 'next/server'
import { getRealCompletedMatches, type Match } from '@/lib/worldCupRealData'

export async function GET() {
  const matches: Match[] = getRealCompletedMatches()
  return NextResponse.json(matches)
}
