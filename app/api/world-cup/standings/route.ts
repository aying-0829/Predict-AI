import { NextResponse } from 'next/server'
import { getRealGroupStandings } from '@/lib/worldCupRealData'

export async function GET() {
  return NextResponse.json(getRealGroupStandings())
}
