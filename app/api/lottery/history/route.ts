import { NextRequest, NextResponse } from 'next/server'
import { getRealLotteryData, toHistoryItems, type RealDraw } from '@/lib/lotteryRealData'
import { getLotteryHistory } from '@/lib/services'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') as 'ssq' | 'dlt' | '3d' | null
  const limit = parseInt(searchParams.get('limit') || '50', 10)

  if (!type || !['ssq', 'dlt', '3d'].includes(type)) {
    return NextResponse.json({ code: -1, message: 'Invalid type parameter' }, { status: 400 })
  }

  try {
    const realData = await getRealLotteryData(type, Math.min(limit, 50))
    if (realData && realData.length > 0) {
      const items = toHistoryItems(realData, type)
      return NextResponse.json({ code: 0, data: items, source: '500.com' })
    }
  } catch (err) {
    console.error('[history] 500.com fetch failed:', err)
  }

  // fallback to local mock
  const mockData = getLotteryHistory(type, limit)
  return NextResponse.json({ code: 0, data: mockData, source: 'mock' })
}
