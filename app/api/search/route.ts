import { NextRequest, NextResponse } from 'next/server'
import { getDB } from '@/lib/db'
import { getSportMatches } from '@/lib/services'

export const dynamic = 'force-dynamic'

interface SearchResult {
  id: string
  type: 'match' | 'lottery' | 'user'
  title: string
  subtitle: string
  url: string
  score?: number
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 1) {
    return NextResponse.json({ code: 0, data: { matches: [], lottery: [], users: [] } })
  }

  const results: { matches: SearchResult[]; lottery: SearchResult[]; users: SearchResult[] } = {
    matches: [],
    lottery: [],
    users: [],
  }

  const keyword = `%${q}%`

  try {
    // ── 赛事搜索 ──
    const sportMatches = getSportMatches('league')
    const lowerQ = q.toLowerCase()
    for (const m of sportMatches) {
      const homeLower = m.homeTeam?.toLowerCase() || ''
      const awayLower = m.awayTeam?.toLowerCase() || ''
      const leagueLower = m.league?.toLowerCase() || ''
      if (homeLower.includes(lowerQ) || awayLower.includes(lowerQ) || leagueLower.includes(lowerQ)) {
        results.matches.push({
          id: m.id,
          type: 'match',
          title: `${m.homeTeam} vs ${m.awayTeam}`,
          subtitle: `${m.league} · ${m.time}`,
          url: `/betting?id=${m.id}`,
        })
      }
    }

    // ── 彩票搜索 ──
    const db = getDB()
    const lotteryRows = db.prepare(
      `SELECT id, lottery_type, numbers, ai_numbers, created_at, is_hit
       FROM predictions
       WHERE lottery_type LIKE ? OR numbers LIKE ? OR ai_numbers LIKE ?
       ORDER BY created_at DESC LIMIT 10`
    ).all(keyword, keyword, keyword) as any[]

    for (const row of lotteryRows) {
      const typeMap: Record<string, string> = { ssq: '双色球', dlt: '大乐透', '3d': '福彩3D', pl5: '排列五' }
      results.lottery.push({
        id: `lottery-${row.id}`,
        type: 'lottery',
        title: `${typeMap[row.lottery_type] || row.lottery_type} 预测`,
        subtitle: `AI推荐: ${row.ai_numbers || '—'} · ${row.is_hit ? '已命中' : '未命中'} · ${row.created_at?.slice(0, 10) || ''}`,
        url: `/lottery/deep?type=${row.lottery_type}`,
      })
    }

    // ── 用户搜索 ──
    const userRows = db.prepare(
      `SELECT id, username, rank, total_predictions, total_hits
       FROM users
       WHERE username LIKE ?
       ORDER BY rank ASC LIMIT 5`
    ).all(keyword) as any[]

    for (const row of userRows) {
      results.users.push({
        id: `user-${row.id}`,
        type: 'user',
        title: row.username || '匿名用户',
        subtitle: `排名 #${row.rank || '—'} · 预测 ${row.total_predictions || 0} 次 · 命中 ${row.total_hits || 0}`,
        url: `/member?user=${row.id}`,
      })
    }
  } catch {
    // DB error, return empty results
  }

  return NextResponse.json({ code: 0, data: results })
}
