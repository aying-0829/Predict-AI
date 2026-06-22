import { NextRequest, NextResponse } from 'next/server'
import { verifyLotteryDraw, recalculateAccuracy } from '@/lib/engine/validation'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth =
    new URL(request.url).searchParams.get('token') ||
    request.headers.get('Authorization')?.replace('Bearer ', '')

  if (auth !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const ssqResult = await verifyLotteryDraw('ssq')
    const dltResult = await verifyLotteryDraw('dlt')
    await recalculateAccuracy()

    return NextResponse.json({
      success: true,
      ssq: ssqResult,
      dlt: dltResult,
      timestamp: new Date().toISOString(),
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
