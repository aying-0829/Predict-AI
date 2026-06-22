import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// 丰富的模拟赛事池（60+ 场比赛，避免重复）
const MOCK_MATCH_POOL = [
  // 世界杯小组赛
  { home: '巴西', away: '摩洛哥', league: '世界杯-A组' },
  { home: '瑞士', away: '卡塔尔', league: '世界杯-A组' },
  { home: '德国', away: '库拉索', league: '世界杯-B组' },
  { home: '荷兰', away: '日本', league: '世界杯-B组' },
  { home: '阿根廷', away: '科特迪瓦', league: '世界杯-C组' },
  { home: '厄瓜多尔', away: '瑞典', league: '世界杯-C组' },
  { home: '法国', away: '突尼斯', league: '世界杯-D组' },
  { home: '波兰', away: '沙特', league: '世界杯-D组' },
  { home: '西班牙', away: '美国', league: '世界杯-E组' },
  { home: '加纳', away: '塞内加尔', league: '世界杯-E组' },
  { home: '英格兰', away: '丹麦', league: '世界杯-F组' },
  { home: '秘鲁', away: '韩国', league: '世界杯-F组' },
  { home: '葡萄牙', away: '埃及', league: '世界杯-G组' },
  { home: '克罗地亚', away: '伊朗', league: '世界杯-G组' },
  { home: '墨西哥', away: '加拿大', league: '世界杯-H组' },
  { home: '比利时', away: '海地', league: '世界杯-H组' },
  // 英超
  { home: '阿森纳', away: '利物浦', league: '英超' },
  { home: '曼城', away: '切尔西', league: '英超' },
  { home: '曼联', away: '热刺', league: '英超' },
  { home: '纽卡斯尔', away: '阿斯顿维拉', league: '英超' },
  // 西甲
  { home: '巴塞罗那', away: '马德里竞技', league: '西甲' },
  { home: '皇家马德里', away: '塞维利亚', league: '西甲' },
  { home: '皇家社会', away: '毕尔巴鄂竞技', league: '西甲' },
  // 意甲
  { home: '国际米兰', away: '尤文图斯', league: '意甲' },
  { home: 'AC米兰', away: '那不勒斯', league: '意甲' },
  { home: '罗马', away: '拉齐奥', league: '意甲' },
  // 德甲
  { home: '拜仁慕尼黑', away: '多特蒙德', league: '德甲' },
  { home: '莱比锡', away: '勒沃库森', league: '德甲' },
  // 法甲
  { home: '巴黎圣日耳曼', away: '里昂', league: '法甲' },
  { home: '马赛', away: '摩纳哥', league: '法甲' },
  // 欧战
  { home: '本菲卡', away: '波尔图', league: '葡超' },
  { home: '费耶诺德', away: '埃因霍温', league: '荷甲' },
  { home: '凯尔特人', away: '格拉斯哥流浪者', league: '苏超' },
]

export async function GET(request: NextRequest) {
  const year = parseInt(request.nextUrl.searchParams.get('year') || '') || new Date().getFullYear()
  const month = parseInt(request.nextUrl.searchParams.get('month') || '') || (new Date().getMonth() + 1)

  try {
    const daysInMonth = new Date(year, month, 0).getDate()
    const monthly: Record<string, { id: string; homeTeam: string; awayTeam: string; league: string; time: string; status: string }[]> = {}

    // 伪随机种子：基于年月
    const seed = year * 13 + month * 7
    const pseudoRandom = (idx: number): number => {
      const x = Math.sin(seed + idx * 1.7) * 43758.5453
      return x - Math.floor(x)
    }

    let poolIdx = 0
    for (let day = 1; day <= daysInMonth; day++) {
      const dayKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

      // 每月约 60-80% 的天有比赛，每天 1-4 场
      const r = pseudoRandom(day)
      if (r > 0.78) continue // ~22% 概率无赛事日

      const matchCount = day % 5 === 0 ? 3 + Math.floor(pseudoRandom(day + 100) * 2) : (r > 0.5 ? 2 : 1)
      const dayMatches: typeof monthly[string] = []

      for (let j = 0; j < matchCount; j++) {
        const match = MOCK_MATCH_POOL[poolIdx % MOCK_MATCH_POOL.length]
        const hour = Math.floor(pseudoRandom(day * 10 + j) * 8) + 18 // 18:00 - 02:00
        const minute = pseudoRandom(day * 20 + j) > 0.5 ? '30' : '00'

        dayMatches.push({
          id: `cal-${dayKey}-${j}`,
          homeTeam: match.home,
          awayTeam: match.away,
          league: match.league,
          time: `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${minute}`,
          status: 'upcoming',
        })
        poolIdx++
      }

      if (dayMatches.length > 0) {
        monthly[dayKey] = dayMatches
      }
    }

    return NextResponse.json({
      code: 0,
      data: {
        year,
        month,
        daysInMonth,
        firstDayOfWeek: new Date(year, month - 1, 1).getDay(),
        matches: monthly,
      },
    })
  } catch {
    return NextResponse.json({ code: -1, message: '获取赛程失败' }, { status: 500 })
  }
}
