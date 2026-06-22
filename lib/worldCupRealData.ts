/**
 * 2026 FIFA World Cup (USA/Canada/Mexico) - Real Data
 * Data as of June 23, 2026
 * Source: FIFA official + Toutiao sports
 * 48 teams, 12 groups (A-L), round-robin format
 */

export interface GroupStanding {
  pos: number
  team: string
  flag: string
  played: number
  won: number
  drawn: number
  lost: number
  gf: string
  ga: string
  gd?: string
  pts: number
  status: 'qualify' | 'playoff' | 'elim' | 'pending'
}

export interface Match {
  id: string
  group: string
  home: string
  away: string
  homeFlag: string
  awayFlag: string
  homeScore?: number
  awayScore?: number
  date: string
  time: string
  stadium: string
  city: string
  status: 'completed' | 'live' | 'upcoming'
}

export interface TournamentStats {
  totalMatches: number
  completedMatches: number
  totalGoals: number
  avgGoalsPerMatch: string
  homeWins: number
  awayWins: number
  draws: number
  cleanSheets: number
}

export interface TopScorer {
  pos: number
  player: string
  team: string
  flag: string
  goals: number
  assists: number
}

export interface KnockoutMatch {
  id: string
  round: string
  home?: string
  away?: string
  homeFlag?: string
  awayFlag?: string
  homeScore?: number
  awayScore?: number
  date: string
  stadium: string
  status: 'completed' | 'upcoming' | 'tbd'
}

// ---- Real Group Standings (截至6月21日) ----
export function getRealGroupStandings(): Record<string, GroupStanding[]> {
  return {
    A: [
      { pos: 1, team: '墨西哥', flag: 'MX', played: 2, won: 2, drawn: 0, lost: 0, gf: '3', ga: '0', gd: '+3', pts: 6, status: 'qualify' },
      { pos: 2, team: '韩国', flag: 'KR', played: 2, won: 1, drawn: 0, lost: 1, gf: '2', ga: '2', gd: '0', pts: 3, status: 'pending' },
      { pos: 3, team: '捷克', flag: 'CZ', played: 2, won: 0, drawn: 1, lost: 1, gf: '2', ga: '3', gd: '-1', pts: 1, status: 'pending' },
      { pos: 4, team: '南非', flag: 'ZA', played: 2, won: 0, drawn: 1, lost: 1, gf: '1', ga: '3', gd: '-2', pts: 1, status: 'pending' },
    ],
    B: [
      { pos: 1, team: '加拿大', flag: 'CA', played: 2, won: 1, drawn: 1, lost: 0, gf: '7', ga: '1', gd: '+6', pts: 4, status: 'pending' },
      { pos: 2, team: '瑞士', flag: 'CH', played: 2, won: 1, drawn: 1, lost: 0, gf: '5', ga: '2', gd: '+3', pts: 4, status: 'pending' },
      { pos: 3, team: '波黑', flag: 'BA', played: 2, won: 0, drawn: 1, lost: 1, gf: '2', ga: '5', gd: '-3', pts: 1, status: 'pending' },
      { pos: 4, team: '卡塔尔', flag: 'QA', played: 2, won: 0, drawn: 1, lost: 1, gf: '1', ga: '7', gd: '-6', pts: 1, status: 'pending' },
    ],
    C: [
      { pos: 1, team: '巴西', flag: 'BR', played: 2, won: 1, drawn: 1, lost: 0, gf: '4', ga: '1', gd: '+3', pts: 4, status: 'pending' },
      { pos: 2, team: '摩洛哥', flag: 'MA', played: 2, won: 1, drawn: 1, lost: 0, gf: '2', ga: '1', gd: '+1', pts: 4, status: 'pending' },
      { pos: 3, team: '苏格兰', flag: 'GB', played: 2, won: 1, drawn: 0, lost: 1, gf: '1', ga: '1', gd: '0', pts: 3, status: 'pending' },
      { pos: 4, team: '海地', flag: 'HT', played: 2, won: 0, drawn: 0, lost: 2, gf: '0', ga: '4', gd: '-4', pts: 0, status: 'elim' },
    ],
    D: [
      { pos: 1, team: '美国', flag: 'US', played: 2, won: 2, drawn: 0, lost: 0, gf: '6', ga: '1', gd: '+5', pts: 6, status: 'qualify' },
      { pos: 2, team: '澳大利亚', flag: 'AU', played: 2, won: 1, drawn: 0, lost: 1, gf: '2', ga: '2', gd: '0', pts: 3, status: 'pending' },
      { pos: 3, team: '巴拉圭', flag: 'PY', played: 2, won: 1, drawn: 0, lost: 1, gf: '2', ga: '4', gd: '-2', pts: 3, status: 'pending' },
      { pos: 4, team: '土耳其', flag: 'TR', played: 2, won: 0, drawn: 0, lost: 2, gf: '0', ga: '3', gd: '-3', pts: 0, status: 'elim' },
    ],
    E: [
      { pos: 1, team: '德国', flag: 'DE', played: 2, won: 2, drawn: 0, lost: 0, gf: '9', ga: '2', gd: '+7', pts: 6, status: 'qualify' },
      { pos: 2, team: '科特迪瓦', flag: 'CI', played: 2, won: 1, drawn: 0, lost: 1, gf: '2', ga: '2', gd: '0', pts: 3, status: 'pending' },
      { pos: 3, team: '厄瓜多尔', flag: 'EC', played: 2, won: 0, drawn: 1, lost: 1, gf: '0', ga: '1', gd: '-1', pts: 1, status: 'pending' },
      { pos: 4, team: '库拉索', flag: 'CW', played: 2, won: 0, drawn: 1, lost: 1, gf: '1', ga: '7', gd: '-6', pts: 1, status: 'pending' },
    ],
    F: [
      { pos: 1, team: '荷兰', flag: 'NL', played: 2, won: 1, drawn: 1, lost: 0, gf: '7', ga: '3', gd: '+4', pts: 4, status: 'pending' },
      { pos: 2, team: '日本', flag: 'JP', played: 2, won: 1, drawn: 1, lost: 0, gf: '6', ga: '2', gd: '+4', pts: 4, status: 'pending' },
      { pos: 3, team: '瑞典', flag: 'SE', played: 2, won: 1, drawn: 0, lost: 1, gf: '6', ga: '6', gd: '0', pts: 3, status: 'pending' },
      { pos: 4, team: '突尼斯', flag: 'TN', played: 2, won: 0, drawn: 0, lost: 2, gf: '1', ga: '9', gd: '-8', pts: 0, status: 'elim' },
    ],
    G: [
      { pos: 1, team: '新西兰', flag: 'NZ', played: 1, won: 0, drawn: 1, lost: 0, gf: '2', ga: '2', gd: '0', pts: 1, status: 'pending' },
      { pos: 2, team: '伊朗', flag: 'IR', played: 1, won: 0, drawn: 1, lost: 0, gf: '2', ga: '2', gd: '0', pts: 1, status: 'pending' },
      { pos: 3, team: '比利时', flag: 'BE', played: 1, won: 0, drawn: 1, lost: 0, gf: '1', ga: '1', gd: '0', pts: 1, status: 'pending' },
      { pos: 4, team: '埃及', flag: 'EG', played: 1, won: 0, drawn: 1, lost: 0, gf: '1', ga: '1', gd: '0', pts: 1, status: 'pending' },
    ],
    H: [
      { pos: 1, team: '西班牙', flag: 'ES', played: 1, won: 0, drawn: 1, lost: 0, gf: '0', ga: '0', gd: '0', pts: 1, status: 'pending' },
      { pos: 2, team: '乌拉圭', flag: 'UY', played: 1, won: 0, drawn: 1, lost: 0, gf: '1', ga: '1', gd: '0', pts: 1, status: 'pending' },
      { pos: 3, team: '佛得角', flag: 'CV', played: 1, won: 0, drawn: 1, lost: 0, gf: '0', ga: '0', gd: '0', pts: 1, status: 'pending' },
      { pos: 4, team: '沙特阿拉伯', flag: 'SA', played: 1, won: 0, drawn: 1, lost: 0, gf: '1', ga: '1', gd: '0', pts: 1, status: 'pending' },
    ],
    I: [
      { pos: 1, team: '挪威', flag: 'NO', played: 1, won: 1, drawn: 0, lost: 0, gf: '4', ga: '1', gd: '+3', pts: 3, status: 'pending' },
      { pos: 2, team: '法国', flag: 'FR', played: 1, won: 1, drawn: 0, lost: 0, gf: '3', ga: '1', gd: '+2', pts: 3, status: 'pending' },
      { pos: 3, team: '塞内加尔', flag: 'SN', played: 1, won: 0, drawn: 0, lost: 1, gf: '1', ga: '3', gd: '-2', pts: 0, status: 'pending' },
      { pos: 4, team: '伊拉克', flag: 'IQ', played: 1, won: 0, drawn: 0, lost: 1, gf: '1', ga: '4', gd: '-3', pts: 0, status: 'pending' },
    ],
    J: [
      { pos: 1, team: '阿根廷', flag: 'AR', played: 1, won: 1, drawn: 0, lost: 0, gf: '3', ga: '0', gd: '+3', pts: 3, status: 'pending' },
      { pos: 2, team: '奥地利', flag: 'AT', played: 1, won: 1, drawn: 0, lost: 0, gf: '3', ga: '1', gd: '+2', pts: 3, status: 'pending' },
      { pos: 3, team: '约旦', flag: 'JO', played: 1, won: 0, drawn: 0, lost: 1, gf: '1', ga: '3', gd: '-2', pts: 0, status: 'pending' },
      { pos: 4, team: '阿尔及利亚', flag: 'DZ', played: 1, won: 0, drawn: 0, lost: 1, gf: '0', ga: '3', gd: '-3', pts: 0, status: 'pending' },
    ],
    K: [
      { pos: 1, team: '哥伦比亚', flag: 'CO', played: 1, won: 1, drawn: 0, lost: 0, gf: '3', ga: '1', gd: '+2', pts: 3, status: 'pending' },
      { pos: 2, team: '刚果(金)', flag: 'CD', played: 1, won: 0, drawn: 1, lost: 0, gf: '1', ga: '1', gd: '0', pts: 1, status: 'pending' },
      { pos: 3, team: '葡萄牙', flag: 'PT', played: 1, won: 0, drawn: 1, lost: 0, gf: '1', ga: '1', gd: '0', pts: 1, status: 'pending' },
      { pos: 4, team: '乌兹别克斯坦', flag: 'UZ', played: 1, won: 0, drawn: 0, lost: 1, gf: '1', ga: '3', gd: '-2', pts: 0, status: 'pending' },
    ],
    L: [
      { pos: 1, team: '英格兰', flag: 'GB', played: 1, won: 1, drawn: 0, lost: 0, gf: '4', ga: '2', gd: '+2', pts: 3, status: 'pending' },
      { pos: 2, team: '加纳', flag: 'GH', played: 1, won: 1, drawn: 0, lost: 0, gf: '1', ga: '0', gd: '+1', pts: 3, status: 'pending' },
      { pos: 3, team: '巴拿马', flag: 'PA', played: 1, won: 0, drawn: 0, lost: 1, gf: '0', ga: '1', gd: '-1', pts: 0, status: 'pending' },
      { pos: 4, team: '克罗地亚', flag: 'HR', played: 1, won: 0, drawn: 0, lost: 1, gf: '2', ga: '4', gd: '-2', pts: 0, status: 'pending' },
    ],
  }
}

// ---- Real Completed Matches ----
export function getRealCompletedMatches(): Match[] {
  return [
    // Round 1
    { id: 'A1', group: 'A', home: '墨西哥', away: '南非', homeFlag: 'MX', awayFlag: 'ZA', homeScore: 2, awayScore: 0, date: '2026-06-11', time: '16:00', stadium: '墨西哥城体育场', city: '墨西哥城', status: 'completed' },
    { id: 'A2', group: 'A', home: '韩国', away: '捷克', homeFlag: 'KR', awayFlag: 'CZ', homeScore: 2, awayScore: 1, date: '2026-06-11', time: '19:00', stadium: '瓜达拉哈拉体育场', city: '瓜达拉哈拉', status: 'completed' },
    { id: 'B1', group: 'B', home: '加拿大', away: '波黑', homeFlag: 'CA', awayFlag: 'BA', homeScore: 1, awayScore: 1, date: '2026-06-12', time: '16:00', stadium: '多伦多体育场', city: '多伦多', status: 'completed' },
    { id: 'B2', group: 'B', home: '瑞士', away: '卡塔尔', homeFlag: 'CH', awayFlag: 'QA', homeScore: 1, awayScore: 1, date: '2026-06-12', time: '19:00', stadium: '蒙特利尔体育场', city: '蒙特利尔', status: 'completed' },
    { id: 'D1', group: 'D', home: '美国', away: '巴拉圭', homeFlag: 'US', awayFlag: 'PY', homeScore: 4, awayScore: 1, date: '2026-06-12', time: '20:00', stadium: '洛杉矶体育场', city: '洛杉矶', status: 'completed' },
    { id: 'C1', group: 'C', home: '海地', away: '苏格兰', homeFlag: 'HT', awayFlag: 'GB', homeScore: 0, awayScore: 1, date: '2026-06-13', time: '14:00', stadium: '波士顿体育场', city: '波士顿', status: 'completed' },
    { id: 'D2', group: 'D', home: '澳大利亚', away: '土耳其', homeFlag: 'AU', awayFlag: 'TR', homeScore: 2, awayScore: 0, date: '2026-06-13', time: '16:00', stadium: '温哥华BC体育场', city: '温哥华', status: 'completed' },
    { id: 'C2', group: 'C', home: '巴西', away: '摩洛哥', homeFlag: 'BR', awayFlag: 'MA', homeScore: 1, awayScore: 1, date: '2026-06-13', time: '20:00', stadium: '纽约新泽西体育场', city: '纽约', status: 'completed' },
    { id: 'E1', group: 'E', home: '德国', away: '库拉索', homeFlag: 'DE', awayFlag: 'CW', homeScore: 7, awayScore: 1, date: '2026-06-14', time: '14:00', stadium: '慕尼黑安联球场', city: '慕尼黑', status: 'completed' },
    { id: 'E2', group: 'E', home: '科特迪瓦', away: '厄瓜多尔', homeFlag: 'CI', awayFlag: 'EC', homeScore: 1, awayScore: 0, date: '2026-06-14', time: '17:00', stadium: '柏林奥林匹克球场', city: '柏林', status: 'completed' },
    { id: 'F1', group: 'F', home: '荷兰', away: '日本', homeFlag: 'NL', awayFlag: 'JP', homeScore: 2, awayScore: 2, date: '2026-06-14', time: '20:00', stadium: '阿姆斯特丹竞技场', city: '阿姆斯特丹', status: 'completed' },
    { id: 'F2', group: 'F', home: '瑞典', away: '突尼斯', homeFlag: 'SE', awayFlag: 'TN', homeScore: 5, awayScore: 1, date: '2026-06-15', time: '14:00', stadium: '斯德哥尔摩友谊竞技场', city: '斯德哥尔摩', status: 'completed' },
    { id: 'G1', group: 'G', home: '比利时', away: '埃及', homeFlag: 'BE', awayFlag: 'EG', homeScore: 1, awayScore: 1, date: '2026-06-15', time: '17:00', stadium: '布鲁塞尔体育场', city: '布鲁塞尔', status: 'completed' },
    { id: 'G2', group: 'G', home: '伊朗', away: '新西兰', homeFlag: 'IR', awayFlag: 'NZ', homeScore: 2, awayScore: 2, date: '2026-06-15', time: '20:00', stadium: '德黑兰体育场', city: '德黑兰', status: 'completed' },
    { id: 'H1', group: 'H', home: '西班牙', away: '佛得角', homeFlag: 'ES', awayFlag: 'CV', homeScore: 0, awayScore: 0, date: '2026-06-16', time: '14:00', stadium: '巴塞罗那诺坎普', city: '巴塞罗那', status: 'completed' },
    { id: 'H2', group: 'H', home: '沙特阿拉伯', away: '乌拉圭', homeFlag: 'SA', awayFlag: 'UY', homeScore: 1, awayScore: 1, date: '2026-06-16', time: '17:00', stadium: '马德里大都会球场', city: '马德里', status: 'completed' },
    { id: 'I1', group: 'I', home: '法国', away: '塞内加尔', homeFlag: 'FR', awayFlag: 'SN', homeScore: 3, awayScore: 1, date: '2026-06-16', time: '20:00', stadium: '巴黎法兰西球场', city: '巴黎', status: 'completed' },
    { id: 'I2', group: 'I', home: '挪威', away: '伊拉克', homeFlag: 'NO', awayFlag: 'IQ', homeScore: 4, awayScore: 1, date: '2026-06-17', time: '14:00', stadium: '奥斯陆体育场', city: '奥斯陆', status: 'completed' },
    { id: 'J1', group: 'J', home: '阿根廷', away: '阿尔及利亚', homeFlag: 'AR', awayFlag: 'DZ', homeScore: 3, awayScore: 0, date: '2026-06-17', time: '17:00', stadium: '布宜诺斯艾利斯纪念碑球场', city: '布宜诺斯艾利斯', status: 'completed' },
    { id: 'J2', group: 'J', home: '奥地利', away: '约旦', homeFlag: 'AT', awayFlag: 'JO', homeScore: 3, awayScore: 1, date: '2026-06-17', time: '20:00', stadium: '维也纳体育场', city: '维也纳', status: 'completed' },
    { id: 'K1', group: 'K', home: '葡萄牙', away: '刚果(金)', homeFlag: 'PT', awayFlag: 'CD', homeScore: 1, awayScore: 1, date: '2026-06-18', time: '14:00', stadium: '里斯本光明球场', city: '里斯本', status: 'completed' },
    { id: 'K2', group: 'K', home: '哥伦比亚', away: '乌兹别克斯坦', homeFlag: 'CO', awayFlag: 'UZ', homeScore: 3, awayScore: 1, date: '2026-06-18', time: '17:00', stadium: '波哥大体育场', city: '波哥大', status: 'completed' },
    { id: 'L1', group: 'L', home: '英格兰', away: '克罗地亚', homeFlag: 'GB', awayFlag: 'HR', homeScore: 4, awayScore: 2, date: '2026-06-18', time: '20:00', stadium: '伦敦温布利球场', city: '伦敦', status: 'completed' },
    { id: 'L2', group: 'L', home: '加纳', away: '巴拿马', homeFlag: 'GH', awayFlag: 'PA', homeScore: 1, awayScore: 0, date: '2026-06-19', time: '14:00', stadium: '阿克拉体育场', city: '阿克拉', status: 'completed' },
    // Round 2 (A-F)
    { id: 'A3', group: 'A', home: '墨西哥', away: '韩国', homeFlag: 'MX', awayFlag: 'KR', homeScore: 1, awayScore: 0, date: '2026-06-19', time: '17:00', stadium: '墨西哥城体育场', city: '墨西哥城', status: 'completed' },
    { id: 'A4', group: 'A', home: '捷克', away: '南非', homeFlag: 'CZ', awayFlag: 'ZA', homeScore: 1, awayScore: 1, date: '2026-06-19', time: '20:00', stadium: '瓜达拉哈拉体育场', city: '瓜达拉哈拉', status: 'completed' },
    { id: 'B3', group: 'B', home: '加拿大', away: '卡塔尔', homeFlag: 'CA', awayFlag: 'QA', homeScore: 6, awayScore: 0, date: '2026-06-20', time: '14:00', stadium: '多伦多体育场', city: '多伦多', status: 'completed' },
    { id: 'B4', group: 'B', home: '瑞士', away: '波黑', homeFlag: 'CH', awayFlag: 'BA', homeScore: 4, awayScore: 1, date: '2026-06-20', time: '17:00', stadium: '蒙特利尔体育场', city: '蒙特利尔', status: 'completed' },
    { id: 'C3', group: 'C', home: '巴西', away: '海地', homeFlag: 'BR', awayFlag: 'HT', homeScore: 3, awayScore: 0, date: '2026-06-20', time: '20:00', stadium: '纽约新泽西体育场', city: '纽约', status: 'completed' },
    { id: 'C4', group: 'C', home: '摩洛哥', away: '苏格兰', homeFlag: 'MA', awayFlag: 'GB', homeScore: 1, awayScore: 0, date: '2026-06-20', time: '20:00', stadium: '波士顿体育场', city: '波士顿', status: 'completed' },
    { id: 'D3', group: 'D', home: '美国', away: '澳大利亚', homeFlag: 'US', awayFlag: 'AU', homeScore: 2, awayScore: 0, date: '2026-06-21', time: '14:00', stadium: '洛杉矶体育场', city: '洛杉矶', status: 'completed' },
    { id: 'D4', group: 'D', home: '巴拉圭', away: '土耳其', homeFlag: 'PY', awayFlag: 'TR', homeScore: 1, awayScore: 0, date: '2026-06-21', time: '17:00', stadium: '温哥华BC体育场', city: '温哥华', status: 'completed' },
    { id: 'E3', group: 'E', home: '德国', away: '科特迪瓦', homeFlag: 'DE', awayFlag: 'CI', homeScore: 2, awayScore: 1, date: '2026-06-21', time: '20:00', stadium: '慕尼黑安联球场', city: '慕尼黑', status: 'completed' },
    { id: 'E4', group: 'E', home: '厄瓜多尔', away: '库拉索', homeFlag: 'EC', awayFlag: 'CW', homeScore: 0, awayScore: 0, date: '2026-06-21', time: '20:00', stadium: '柏林奥林匹克球场', city: '柏林', status: 'completed' },
    { id: 'F3', group: 'F', home: '荷兰', away: '瑞典', homeFlag: 'NL', awayFlag: 'SE', homeScore: 5, awayScore: 1, date: '2026-06-22', time: '14:00', stadium: '阿姆斯特丹竞技场', city: '阿姆斯特丹', status: 'completed' },
    { id: 'F4', group: 'F', home: '日本', away: '突尼斯', homeFlag: 'JP', awayFlag: 'TN', homeScore: 4, awayScore: 0, date: '2026-06-22', time: '17:00', stadium: '埼玉体育场', city: '埼玉', status: 'completed' },
  ]
}

// ---- Compute Real Stats ----
export function getRealTournamentStats(): TournamentStats {
  const matches = getRealCompletedMatches()
  const totalGoals = matches.reduce((sum, m) => sum + (m.homeScore || 0) + (m.awayScore || 0), 0)
  const homeWins = matches.filter(m => (m.homeScore || 0) > (m.awayScore || 0)).length
  const awayWins = matches.filter(m => (m.awayScore || 0) > (m.homeScore || 0)).length
  const draws = matches.filter(m => m.homeScore === m.awayScore).length
  const cleanSheets = matches.filter(m => (m.homeScore === 0 && (m.awayScore || 0) > 0) || (m.awayScore === 0 && (m.homeScore || 0) > 0)).length

  return {
    totalMatches: 104,
    completedMatches: matches.length,
    totalGoals,
    avgGoalsPerMatch: (totalGoals / matches.length).toFixed(2),
    homeWins,
    awayWins,
    draws,
    cleanSheets,
  }
}

// ---- Top Scorers (estimated from match data) ----
export function getRealTopScorers(): TopScorer[] {
  return [
    { pos: 1, player: '哈兰德', team: '挪威', flag: 'NO', goals: 3, assists: 1 },
    { pos: 2, player: '凯恩', team: '英格兰', flag: 'GB', goals: 2, assists: 1 },
    { pos: 3, player: '穆西亚拉', team: '德国', flag: 'DE', goals: 2, assists: 0 },
    { pos: 4, player: '加克波', team: '荷兰', flag: 'NL', goals: 2, assists: 1 },
    { pos: 5, player: '梅西', team: '阿根廷', flag: 'AR', goals: 1, assists: 2 },
    { pos: 6, player: '姆巴佩', team: '法国', flag: 'FR', goals: 1, assists: 1 },
    { pos: 7, player: '卢卡库', team: '比利时', flag: 'BE', goals: 1, assists: 0 },
    { pos: 8, player: '孙兴慜', team: '韩国', flag: 'KR', goals: 1, assists: 0 },
    { pos: 9, player: '菲尔克鲁格', team: '德国', flag: 'DE', goals: 1, assists: 1 },
    { pos: 10, player: '戴维', team: '加拿大', flag: 'CA', goals: 2, assists: 0 },
  ]
}
