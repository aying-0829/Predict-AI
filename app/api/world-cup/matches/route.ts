import { NextResponse } from 'next/server'
import { getRealCompletedMatches } from '@/lib/worldCupRealData'

export async function GET() {
  return NextResponse.json(getRealCompletedMatches())
}