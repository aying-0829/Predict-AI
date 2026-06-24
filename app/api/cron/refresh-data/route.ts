import { NextResponse } from 'next/server'
import { fetchWorldCupGames, fetchWorldCupGroups } from '@/lib/footballApi'

/**
 * POST /api/cron/refresh-data
 * 手动触发数据刷新，从 worldcup26.ir 拉取最新比赛和积分数据
 * 可在 Railway 设置定时 cron 或手动调用
 */
export async function POST() {
  try {
    const [games, groups] = await Promise.all([
      fetchWorldCupGames(),
      fetchWorldCupGroups(),
    ])

    const finished = games?.filter((g: any) => {
      const s = (g.finished || g.time_elapsed || g.status || '').toLowerCase()
      return s === 'true' || s === 'finished' || s.includes('ft') || s.includes('ended')
    }).length || 0

    const total = games?.length || 0

    return NextResponse.json({
      code: 0,
      data: {
        totalMatches: total,
        completedMatches: finished,
        groupsCount: groups?.length || 0,
        refreshedAt: new Date().toISOString(),
      },
      source: 'worldcup26.ir',
    })
  } catch (error: any) {
    return NextResponse.json({
      code: 1,
      error: error.message || 'refresh failed',
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}
