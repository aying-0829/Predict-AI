export type SportMatch = {
  id: string
  league: string
  homeTeam: string
  awayTeam: string
  homeFlag: string
  awayFlag: string
  time: string
  status: 'live' | 'upcoming' | 'finished'
  homeScore?: number
  awayScore?: number
  minute?: number
  aiPrediction: {
    winner: 'home' | 'away' | 'draw'
    confidence: number
    scorePrediction: string
    bar: { home: number; draw: number; away: number }
  }
  actualResult?: {
    homeScore: number
    awayScore: number
    hit: boolean
  }
}

export function getSportMatches(filter?: 'today' | 'league' | 'finished'): SportMatch[] {
  if (filter === 'today') {
    return [
      {
        id: 's1', league: '巴西杯', homeTeam: '巴西', awayTeam: '摩洛哥',
        homeFlag: '🇧🇷', awayFlag: '🇲🇦', time: '06-14 03:00',
        status: 'live', homeScore: 2, awayScore: 1, minute: 67,
        aiPrediction: { winner: 'home', confidence: 67, scorePrediction: '2-0',
          bar: { home: 62, draw: 23, away: 15 } },
      },
      {
        id: 's2', league: '欧洲杯', homeTeam: '法国', awayTeam: '英格兰',
        homeFlag: '🇫🇷', awayFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', time: '06-14 03:00',
        status: 'live', homeScore: 0, awayScore: 0, minute: 32,
        aiPrediction: { winner: 'draw', confidence: 55, scorePrediction: '1-1',
          bar: { home: 35, draw: 40, away: 25 } },
      },
      {
        id: 's3', league: '欧洲杯', homeTeam: '阿根廷', awayTeam: '德国',
        homeFlag: '🇦🇷', awayFlag: '🇩🇪', time: '06-14 05:00',
        status: 'upcoming',
        aiPrediction: { winner: 'home', confidence: 58, scorePrediction: '2-1',
          bar: { home: 52, draw: 28, away: 20 } },
      },
      {
        id: 's4', league: '欧洲杯', homeTeam: '西班牙', awayTeam: '葡萄牙',
        homeFlag: '🇪🇸', awayFlag: '🇵🇹', time: '06-14 05:30',
        status: 'upcoming',
        aiPrediction: { winner: 'draw', confidence: 50, scorePrediction: '1-1',
          bar: { home: 30, draw: 45, away: 25 } },
      },
    ]
  }

  if (filter === 'league') {
    const leagues: { league: string; matches: SportMatch[] }[] = [
      {
        league: '英超',
        matches: [
          { id: 'pl1', league: '英超', homeTeam: '曼城', awayTeam: '利物浦', homeFlag: '🏴', awayFlag: '🏴', time: '06-15 22:00', status: 'upcoming', aiPrediction: { winner: 'home', confidence: 55, scorePrediction: '2-1', bar: { home: 48, draw: 28, away: 24 } } },
          { id: 'pl2', league: '英超', homeTeam: '阿森纳', awayTeam: '切尔西', homeFlag: '🏴', awayFlag: '🏴', time: '06-16 00:30', status: 'upcoming', aiPrediction: { winner: 'home', confidence: 52, scorePrediction: '2-0', bar: { home: 45, draw: 30, away: 25 } } },
        ],
      },
      {
        league: '西甲',
        matches: [
          { id: 'll1', league: '西甲', homeTeam: '皇马', awayTeam: '巴萨', homeFlag: '🇪🇸', awayFlag: '🇪🇸', time: '06-15 03:00', status: 'upcoming', aiPrediction: { winner: 'draw', confidence: 48, scorePrediction: '2-2', bar: { home: 35, draw: 38, away: 27 } } },
          { id: 'll2', league: '西甲', homeTeam: '马竞', awayTeam: '塞维利亚', homeFlag: '🇪🇸', awayFlag: '🇪🇸', time: '06-16 01:00', status: 'upcoming', aiPrediction: { winner: 'home', confidence: 62, scorePrediction: '2-0', bar: { home: 58, draw: 25, away: 17 } } },
        ],
      },
      {
        league: '德甲',
        matches: [
          { id: 'bl1', league: '德甲', homeTeam: '拜仁', awayTeam: '多特蒙德', homeFlag: '🇩🇪', awayFlag: '🇩🇪', time: '06-15 00:30', status: 'upcoming', aiPrediction: { winner: 'home', confidence: 60, scorePrediction: '3-1', bar: { home: 55, draw: 25, away: 20 } } },
          { id: 'bl2', league: '德甲', homeTeam: '莱比锡', awayTeam: '勒沃库森', homeFlag: '🇩🇪', awayFlag: '🇩🇪', time: '06-16 02:30', status: 'upcoming', aiPrediction: { winner: 'home', confidence: 51, scorePrediction: '1-0', bar: { home: 42, draw: 33, away: 25 } } },
        ],
      },
      {
        league: '意甲',
        matches: [
          { id: 'sa1', league: '意甲', homeTeam: 'AC米兰', awayTeam: '尤文图斯', homeFlag: '🇮🇹', awayFlag: '🇮🇹', time: '06-15 02:45', status: 'upcoming', aiPrediction: { winner: 'draw', confidence: 45, scorePrediction: '1-1', bar: { home: 32, draw: 40, away: 28 } } },
          { id: 'sa2', league: '意甲', homeTeam: '国米', awayTeam: '那不勒斯', homeFlag: '🇮🇹', awayFlag: '🇮🇹', time: '06-16 03:45', status: 'upcoming', aiPrediction: { winner: 'home', confidence: 57, scorePrediction: '2-1', bar: { home: 50, draw: 28, away: 22 } } },
        ],
      },
    ]
    return leagues.flatMap(l => l.matches)
  }

  if (filter === 'finished') {
    return [
      { id: 'f1', league: '巴西杯', homeTeam: '巴西', awayTeam: '摩洛哥', homeFlag: '🇧🇷', awayFlag: '🇲🇦', time: '06-13 03:00', status: 'finished', homeScore: 2, awayScore: 0, aiPrediction: { winner: 'home', confidence: 67, scorePrediction: '2-0', bar: { home: 62, draw: 23, away: 15 } }, actualResult: { homeScore: 2, awayScore: 0, hit: true } },
      { id: 'f2', league: '欧洲杯', homeTeam: '法国', awayTeam: '英格兰', homeFlag: '🇫🇷', awayFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', time: '06-13 03:00', status: 'finished', homeScore: 1, awayScore: 2, aiPrediction: { winner: 'draw', confidence: 55, scorePrediction: '1-1', bar: { home: 35, draw: 40, away: 25 } }, actualResult: { homeScore: 1, awayScore: 2, hit: false } },
      { id: 'f3', league: '欧洲杯', homeTeam: '阿根廷', awayTeam: '德国', homeFlag: '🇦🇷', awayFlag: '🇩🇪', time: '06-12 05:00', status: 'finished', homeScore: 2, awayScore: 1, aiPrediction: { winner: 'home', confidence: 58, scorePrediction: '2-1', bar: { home: 52, draw: 28, away: 20 } }, actualResult: { homeScore: 2, awayScore: 1, hit: true } },
      { id: 'f4', league: '欧洲杯', homeTeam: '西班牙', awayTeam: '葡萄牙', homeFlag: '🇪🇸', awayFlag: '🇵🇹', time: '06-12 05:30', status: 'finished', homeScore: 2, awayScore: 2, aiPrediction: { winner: 'draw', confidence: 50, scorePrediction: '1-1', bar: { home: 30, draw: 45, away: 25 } }, actualResult: { homeScore: 2, awayScore: 2, hit: false } },
    ]
  }

  return []
}

export type HandicapItem = {
  matchId: string
  homeTeam: string
  awayTeam: string
  handicap: string
  odds: { home: number; draw: number; away: number }
  aiPick: 'home' | 'away' | 'draw'
}

export function getHandicapData(): HandicapItem[] {
  return [
    { matchId: 's1', homeTeam: '巴西', awayTeam: '摩洛哥', handicap: '-1', odds: { home: 1.85, draw: 3.5, away: 4.2 }, aiPick: 'home' },
    { matchId: 's2', homeTeam: '法国', awayTeam: '英格兰', handicap: '0', odds: { home: 2.45, draw: 3.1, away: 2.9 }, aiPick: 'draw' },
    { matchId: 's3', homeTeam: '阿根廷', awayTeam: '德国', handicap: '-0.5', odds: { home: 2.1, draw: 3.3, away: 3.4 }, aiPick: 'home' },
    { matchId: 's4', homeTeam: '西班牙', awayTeam: '葡萄牙', handicap: '0', odds: { home: 2.55, draw: 3.0, away: 2.8 }, aiPick: 'draw' },
    { matchId: 'pl1', homeTeam: '曼城', awayTeam: '利物浦', handicap: '-0.5', odds: { home: 2.05, draw: 3.4, away: 3.6 }, aiPick: 'home' },
    { matchId: 'pl2', homeTeam: '阿森纳', awayTeam: '切尔西', handicap: '-0/0.5', odds: { home: 2.15, draw: 3.2, away: 3.3 }, aiPick: 'home' },
    { matchId: 'll1', homeTeam: '皇马', awayTeam: '巴萨', handicap: '0', odds: { home: 2.6, draw: 3.1, away: 2.7 }, aiPick: 'draw' },
    { matchId: 'll2', homeTeam: '马竞', awayTeam: '塞维利亚', handicap: '-1', odds: { home: 1.9, draw: 3.4, away: 4.0 }, aiPick: 'home' },
  ]
}

export type AIAnalysisResult = {
  safest: { match: string; reason: string }
  over25: { match: string; reason: string }
  upset: { match: string; reason: string }
}

export function getAIAnalysis(): AIAnalysisResult {
  return {
    safest: { match: '巴西 vs 摩洛哥', reason: '巴西近期状态火热，摩洛哥防线存在明显漏洞，AI模型给出 62% 主胜概率，为今日最高置信度场次。' },
    over25: { match: '拜仁 vs 多特蒙德', reason: '两队近 5 次交锋场均进球 3.4 球，双方攻击线火力充足，进球数大于 2.5 概率达 71%。' },
    upset: { match: '西班牙 vs 葡萄牙', reason: '葡萄牙近期客场表现强势，AI 模型检测到冷门信号，平局概率高达 45%，显著高于市场预期。' },
  }
}

export type BetSelection = {
  matchId: string
  pick: string
  odds: number
}

export function submitBetSlip(selections: BetSelection[]) {
  const totalOdds = selections.reduce((acc, s) => acc * s.odds, 1)
  return {
    totalOdds: Math.round(totalOdds * 100) / 100,
    cost: 100,
  }
}
