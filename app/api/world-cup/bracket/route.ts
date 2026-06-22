import { NextResponse } from 'next/server'
import { getKnockoutBracket } from '@/lib/services'

export async function GET() {
  return NextResponse.json(getKnockoutBracket())
}
