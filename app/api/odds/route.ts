import { NextRequest, NextResponse } from 'next/server'
import { getSportMatches } from '@/lib/services'

export const dynamic = 'force-dynamic'

interface OddsEntry {
  matchId: string
  homeTeam: string
  awayTeam: string
  league: string
  time: string
  marketOdds: {
    homeWin: number
    draw: number
    awayWin: number
    provider: string
  }
  platformPrediction: {
    homeProb: number
    drawProb: number
    awayProb: number
    confidence: number
  }
  valueIndicator: 'home' | 'draw' | 'away' | null
  valueDiff: number
}

export async function GET(request: NextRequest) {
  const matchId = request.nextUrl.searchParams.get('matchId') || ''

  try {
    const matches = getSportMatches('league')
    const odds: OddsEntry[] = []

    for (const m of matches) {
      // 市场赔率（模拟多家博彩公司均值）
      const homeWin = +(1.5 + Math.random() * 3).toFixed(2)
      const draw = +(2.8 + Math.random() * 2).toFixed(2)
      const awayWin = +(2.0 + Math.random() * 5).toFixed(2)

      // 平台AI预测概率
      const pred = m.aiPrediction
      let homeProb = 35, drawProb = 30, awayProb = 35
      if (pred?.winner === 'home') {
        homeProb = 45 + Math.floor(Math.random() * 15)
        drawProb = 25 + Math.floor(Math.random() * 10)
        awayProb = 100 - homeProb - drawProb
      } else if (pred?.winner === 'draw') {
        drawProb = 40 + Math.floor(Math.random() * 15)
        homeProb = 25 + Math.floor(Math.random() * 10)
        awayProb = 100 - drawProb - homeProb
      } else {
        awayProb = 45 + Math.floor(Math.random() * 15)
        homeProb = 25 + Math.floor(Math.random() * 10)
        drawProb = 100 - awayProb - homeProb
      }

      // 计算隐含概率（赔率倒数归一化）
      const impHome = 1 / homeWin
      const impDraw = 1 / draw
      const impAway = 1 / awayWin
      const totalImp = impHome + impDraw + impAway
      const mktHomeProb = Math.round((impHome / totalImp) * 100)
      const mktAwayProb = Math.round((impAway / totalImp) * 100)

      // 价值投注检测：平台预测与市场隐含概率差异>10%
      let valueIndicator: 'home' | 'draw' | 'away' | null = null
      let valueDiff = 0
      const diffHome = homeProb - mktHomeProb
      const diffAway = awayProb - mktAwayProb

      if (diffHome > 10) {
        valueIndicator = 'home'
        valueDiff = diffHome
      } else if (diffAway > 10) {
        valueIndicator = 'away'
        valueDiff = diffAway
      }

      odds.push({
        matchId: m.id,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        league: m.league,
        time: m.time,
        marketOdds: { homeWin, draw, awayWin, provider: '综合市场' },
        platformPrediction: {
          homeProb,
          drawProb,
          awayProb,
          confidence: pred?.confidence || 65,
        },
        valueIndicator,
        valueDiff,
      })
    }

    let result = odds
    if (matchId) {
      result = odds.filter(o => o.matchId === matchId)
    }

    return NextResponse.json({ code: 0, data: result })
  } catch {
    return NextResponse.json({ code: -1, message: '获取赔率数据失败' }, { status: 500 })
  }
}
