import { NextResponse } from 'next/server'
import { getLotteryTypes } from '@/lib/services'

export async function GET() {
  return NextResponse.json({ code: 0, data: getLotteryTypes() })
}
