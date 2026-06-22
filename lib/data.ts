export interface Match {
  id: string;
  time: string;
  league: string;
  group: string;
  home: string;
  homeFlag: string;
  away: string;
  awayFlag: string;
  homeWin: number;
  draw: number;
  awayWin: number;
  aiScore?: string;
}

export interface LotteryDraw {
  id: string;
  name: string;
  period: string;
  date: string;
  redBalls: number[];
  blueBalls: number[];
  aiRecommend: {
    red: number[];
    blue: number[];
  };
}

export interface LiveEvent {
  minute: number;
  text: string;
  type: 'goal' | 'card' | 'chance' | 'info';
}

export const worldCupMatches: Match[] = [
  {
    id: 'wc001', time: '06-14 03:00', league: '世界杯', group: 'G组',
    home: '卡塔尔', homeFlag: 'QA', away: '瑞士', awayFlag: 'CH',
    homeWin: 22, draw: 31, awayWin: 47, aiScore: '1:2'
  },
  {
    id: 'wc002', time: '06-14 06:00', league: '世界杯', group: 'D组',
    home: '巴西', homeFlag: 'BR', away: '摩洛哥', awayFlag: 'MA',
    homeWin: 58, draw: 25, awayWin: 17, aiScore: '3:1'
  },
  {
    id: 'wc003', time: '06-14 09:00', league: '世界杯', group: 'E组',
    home: '海地', homeFlag: 'HT', away: '苏格兰', awayFlag: 'GB-SCT',
    homeWin: 12, draw: 20, awayWin: 68, aiScore: '0:2'
  },
  {
    id: 'wc004', time: '06-14 12:00', league: '世界杯', group: 'F组',
    home: '澳大利亚', homeFlag: 'AU', away: '土耳其', awayFlag: 'TR',
    homeWin: 35, draw: 30, awayWin: 35, aiScore: '1:1'
  },
  {
    id: 'wc005', time: '06-15 01:00', league: '世界杯', group: 'H组',
    home: '德国', homeFlag: 'DE', away: '库拉索', awayFlag: 'CW',
    homeWin: 82, draw: 13, awayWin: 5, aiScore: '4:0'
  },
  {
    id: 'wc006', time: '06-15 04:00', league: '世界杯', group: 'C组',
    home: '荷兰', homeFlag: 'NL', away: '日本', awayFlag: 'JP',
    homeWin: 52, draw: 28, awayWin: 20, aiScore: '2:1'
  },
  {
    id: 'wc007', time: '06-15 07:00', league: '世界杯', group: 'A组',
    home: '科特迪瓦', homeFlag: 'CI', away: '厄瓜多尔', awayFlag: 'EC',
    homeWin: 38, draw: 32, awayWin: 30, aiScore: '1:1'
  },
  {
    id: 'wc008', time: '06-15 10:00', league: '世界杯', group: 'B组',
    home: '瑞典', homeFlag: 'SE', away: '突尼斯', awayFlag: 'TN',
    homeWin: 55, draw: 26, awayWin: 19, aiScore: '2:0'
  },
]

export const lotteryData: LotteryDraw[] = [
  {
    id: 'ssq001', name: '双色球', period: '2026065', date: '2026-06-11',
    redBalls: [3, 8, 15, 22, 28, 31], blueBalls: [7],
    aiRecommend: { red: [5, 11, 18, 23, 27, 33], blue: [9, 12] }
  },
  {
    id: 'ssq002', name: '双色球', period: '2026064', date: '2026-06-09',
    redBalls: [1, 6, 12, 19, 24, 30], blueBalls: [14],
    aiRecommend: { red: [2, 9, 14, 21, 26, 32], blue: [5, 11] }
  },
  {
    id: 'dlt001', name: '大乐透', period: '2026065', date: '2026-06-11',
    redBalls: [5, 11, 17, 23, 29], blueBalls: [3, 8],
    aiRecommend: { red: [4, 10, 16, 24, 31], blue: [6, 10] }
  },
]

export const accuracyStats = {
  worldCup: 76.3,
  top5Leagues: 71.8,
  nba: 68.5,
  totalAnalyzed: 126804,
  leaguesCovered: 47,
}

/* ===== 世界杯小组赛数据 ===== */
export interface GroupStanding {
  pos: number
  team: string
  flag: string
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  pts: number
  status: 'qualify' | 'playoff' | 'elim'
}

export const groupStandings: Record<string, GroupStanding[]> = {
  'A组': [
    { pos: 1, team: '科特迪瓦', flag: 'CI', played: 3, won: 2, drawn: 1, lost: 0, gf: 6, ga: 2, pts: 7, status: 'qualify' },
    { pos: 2, team: '厄瓜多尔', flag: 'EC', played: 3, won: 1, drawn: 2, lost: 0, gf: 4, ga: 2, pts: 5, status: 'qualify' },
    { pos: 3, team: '波兰', flag: 'PL', played: 3, won: 1, drawn: 0, lost: 2, gf: 3, ga: 5, pts: 3, status: 'playoff' },
    { pos: 4, team: '沙特', flag: 'SA', played: 3, won: 0, drawn: 1, lost: 2, gf: 1, ga: 5, pts: 1, status: 'elim' },
  ],
  'B组': [
    { pos: 1, team: '瑞典', flag: 'SE', played: 3, won: 2, drawn: 1, lost: 0, gf: 5, ga: 1, pts: 7, status: 'qualify' },
    { pos: 2, team: '突尼斯', flag: 'TN', played: 3, won: 1, drawn: 1, lost: 1, gf: 3, ga: 4, pts: 4, status: 'qualify' },
    { pos: 3, team: '美国', flag: 'US', played: 3, won: 1, drawn: 0, lost: 2, gf: 3, ga: 5, pts: 3, status: 'playoff' },
    { pos: 4, team: '加纳', flag: 'GH', played: 3, won: 0, drawn: 2, lost: 1, gf: 2, ga: 3, pts: 2, status: 'elim' },
  ],
  'C组': [
    { pos: 1, team: '荷兰', flag: 'NL', played: 3, won: 3, drawn: 0, lost: 0, gf: 7, ga: 2, pts: 9, status: 'qualify' },
    { pos: 2, team: '日本', flag: 'JP', played: 3, won: 2, drawn: 0, lost: 1, gf: 4, ga: 3, pts: 6, status: 'qualify' },
    { pos: 3, team: '塞内加尔', flag: 'SN', played: 3, won: 1, drawn: 0, lost: 2, gf: 3, ga: 5, pts: 3, status: 'playoff' },
    { pos: 4, team: '威尔士', flag: 'GB-WLS', played: 3, won: 0, drawn: 0, lost: 3, gf: 1, ga: 5, pts: 0, status: 'elim' },
  ],
  'D组': [
    { pos: 1, team: '巴西', flag: 'BR', played: 3, won: 3, drawn: 0, lost: 0, gf: 8, ga: 1, pts: 9, status: 'qualify' },
    { pos: 2, team: '摩洛哥', flag: 'MA', played: 3, won: 1, drawn: 1, lost: 1, gf: 3, ga: 4, pts: 4, status: 'qualify' },
    { pos: 3, team: '丹麦', flag: 'DK', played: 3, won: 1, drawn: 0, lost: 2, gf: 2, ga: 5, pts: 3, status: 'playoff' },
    { pos: 4, team: '秘鲁', flag: 'PE', played: 3, won: 0, drawn: 1, lost: 2, gf: 1, ga: 4, pts: 1, status: 'elim' },
  ],
  'E组': [
    { pos: 1, team: '苏格兰', flag: 'GB-SCT', played: 3, won: 2, drawn: 0, lost: 1, gf: 5, ga: 3, pts: 6, status: 'qualify' },
    { pos: 2, team: '海地', flag: 'HT', played: 3, won: 1, drawn: 1, lost: 1, gf: 3, ga: 4, pts: 4, status: 'qualify' },
    { pos: 3, team: '韩国', flag: 'KR', played: 3, won: 1, drawn: 1, lost: 1, gf: 3, ga: 4, pts: 4, status: 'playoff' },
    { pos: 4, team: '埃及', flag: 'EG', played: 3, won: 0, drawn: 2, lost: 1, gf: 2, ga: 3, pts: 2, status: 'elim' },
  ],
  'F组': [
    { pos: 1, team: '土耳其', flag: 'TR', played: 3, won: 2, drawn: 1, lost: 0, gf: 5, ga: 2, pts: 7, status: 'qualify' },
    { pos: 2, team: '澳大利亚', flag: 'AU', played: 3, won: 1, drawn: 2, lost: 0, gf: 4, ga: 3, pts: 5, status: 'qualify' },
    { pos: 3, team: '克罗地亚', flag: 'HR', played: 3, won: 1, drawn: 0, lost: 2, gf: 3, ga: 5, pts: 3, status: 'playoff' },
    { pos: 4, team: '伊朗', flag: 'IR', played: 3, won: 0, drawn: 1, lost: 2, gf: 2, ga: 4, pts: 1, status: 'elim' },
  ],
  'G组': [
    { pos: 1, team: '瑞士', flag: 'CH', played: 3, won: 2, drawn: 1, lost: 0, gf: 5, ga: 2, pts: 7, status: 'qualify' },
    { pos: 2, team: '卡塔尔', flag: 'QA', played: 3, won: 1, drawn: 1, lost: 1, gf: 3, ga: 4, pts: 4, status: 'qualify' },
    { pos: 3, team: '墨西哥', flag: 'MX', played: 3, won: 1, drawn: 0, lost: 2, gf: 3, ga: 5, pts: 3, status: 'playoff' },
    { pos: 4, team: '加拿大', flag: 'CA', played: 3, won: 0, drawn: 2, lost: 1, gf: 2, ga: 3, pts: 2, status: 'elim' },
  ],
  'H组': [
    { pos: 1, team: '德国', flag: 'DE', played: 3, won: 3, drawn: 0, lost: 0, gf: 10, ga: 1, pts: 9, status: 'qualify' },
    { pos: 2, team: '库拉索', flag: 'CW', played: 3, won: 1, drawn: 1, lost: 1, gf: 3, ga: 4, pts: 4, status: 'qualify' },
    { pos: 3, team: '比利时', flag: 'BE', played: 3, won: 1, drawn: 0, lost: 2, gf: 3, ga: 6, pts: 3, status: 'playoff' },
    { pos: 4, team: '阿根廷', flag: 'AR', played: 3, won: 0, drawn: 1, lost: 2, gf: 1, ga: 5, pts: 1, status: 'elim' },
  ],
}

export const groupNames = ['A组', 'B组', 'C组', 'D组', 'E组', 'F组', 'G组', 'H组']

/* ===== 淘汰赛对阵数据 ===== */
export interface KnockoutSlot {
  round: string
  home: string
  homeFlag: string
  away: string
  awayFlag: string
  isDecided: boolean
  aiPredict?: string
}

export const knockoutBracket: KnockoutSlot[][] = [
  // 小组赛晋级 (16队)
  [
    { round: '小组赛晋级', home: '科特迪瓦', homeFlag: 'CI', away: '厄瓜多尔', awayFlag: 'EC', isDecided: true },
    { round: '小组赛晋级', home: '瑞典', homeFlag: 'SE', away: '突尼斯', awayFlag: 'TN', isDecided: true },
    { round: '小组赛晋级', home: '荷兰', homeFlag: 'NL', away: '日本', awayFlag: 'JP', isDecided: true },
    { round: '小组赛晋级', home: '巴西', homeFlag: 'BR', away: '摩洛哥', awayFlag: 'MA', isDecided: true },
    { round: '小组赛晋级', home: '苏格兰', homeFlag: 'GB-SCT', away: '海地', awayFlag: 'HT', isDecided: true },
    { round: '小组赛晋级', home: '土耳其', homeFlag: 'TR', away: '澳大利亚', awayFlag: 'AU', isDecided: true },
    { round: '小组赛晋级', home: '瑞士', homeFlag: 'CH', away: '卡塔尔', awayFlag: 'QA', isDecided: true },
    { round: '小组赛晋级', home: '德国', homeFlag: 'DE', away: '库拉索', awayFlag: 'CW', isDecided: true },
  ],
  // 1/8 决赛
  [
    { round: '1/8 决赛', home: '科特迪瓦', homeFlag: 'CI', away: '突尼斯', awayFlag: 'TN', isDecided: true, aiPredict: '2:1' },
    { round: '1/8 决赛', home: '巴西', homeFlag: 'BR', away: '海地', awayFlag: 'HT', isDecided: true, aiPredict: '3:0' },
    { round: '1/8 决赛', home: '苏格兰', homeFlag: 'GB-SCT', away: '摩洛哥', awayFlag: 'MA', isDecided: true, aiPredict: '1:1' },
    { round: '1/8 决赛', home: '瑞士', homeFlag: 'CH', away: '库拉索', awayFlag: 'CW', isDecided: true, aiPredict: '2:0' },
    { round: '1/8 决赛', home: '荷兰', homeFlag: 'NL', away: '厄瓜多尔', awayFlag: 'EC', isDecided: true, aiPredict: '2:0' },
    { round: '1/8 决赛', home: '瑞典', homeFlag: 'SE', away: '日本', awayFlag: 'JP', isDecided: true, aiPredict: '1:1' },
    { round: '1/8 决赛', home: '德国', homeFlag: 'DE', away: '澳大利亚', awayFlag: 'AU', isDecided: true, aiPredict: '3:1' },
    { round: '1/8 决赛', home: '土耳其', homeFlag: 'TR', away: '卡塔尔', awayFlag: 'QA', isDecided: true, aiPredict: '2:1' },
  ],
  // 1/4 决赛
  [
    { round: '1/4 决赛', home: '巴西', homeFlag: 'BR', away: '苏格兰', awayFlag: 'GB-SCT', isDecided: false, aiPredict: '2:0' },
    { round: '1/4 决赛', home: '瑞士', homeFlag: 'CH', away: '荷兰', awayFlag: 'NL', isDecided: false, aiPredict: '1:2' },
    { round: '1/4 决赛', home: '瑞典', homeFlag: 'SE', away: '科特迪瓦', awayFlag: 'CI', isDecided: false, aiPredict: '1:1' },
    { round: '1/4 决赛', home: '德国', homeFlag: 'DE', away: '土耳其', awayFlag: 'TR', isDecided: false, aiPredict: '3:0' },
  ],
  // 半决赛
  [
    { round: '半决赛', home: '巴西', homeFlag: 'BR', away: '荷兰', awayFlag: 'NL', isDecided: false, aiPredict: '2:1' },
    { round: '半决赛', home: '瑞典', homeFlag: 'SE', away: '德国', awayFlag: 'DE', isDecided: false, aiPredict: '0:2' },
  ],
  // 决赛
  [
    { round: '决赛', home: '巴西', homeFlag: 'BR', away: '德国', awayFlag: 'DE', isDecided: false, aiPredict: '1:1' },
  ],
]

/* ===== 射手榜 ===== */
export interface Scorer {
  rank: number
  name: string
  flag: string
  goals: number
}

export const topScorers: Scorer[] = [
  { rank: 1, name: '穆西亚拉', flag: 'DE', goals: 6 },
  { rank: 2, name: '维尼修斯', flag: 'BR', goals: 5 },
  { rank: 3, name: '恩博洛', flag: 'CH', goals: 4 },
  { rank: 4, name: '加克波', flag: 'NL', goals: 4 },
  { rank: 5, name: '伊萨克', flag: 'SE', goals: 3 },
  { rank: 6, name: '三笘薫', flag: 'JP', goals: 3 },
  { rank: 7, name: '穆勒', flag: 'DE', goals: 3 },
  { rank: 8, name: '麦克托米奈', flag: 'GB-SCT', goals: 2 },
]

/* ===== 赛事统计 ===== */
export const tournamentStats = {
  matchesPlayed: 48,
  totalMatches: 64,
  totalGoals: 137,
  avgGoalsPerMatch: 2.85,
  yellowCards: 87,
  redCards: 3,
  aiAccuracy: 76.3,
}

/* ===== 文字直播弹幕池 ===== */
export const danmakuPool: string[] = [
  '🇧🇷 桑巴军团冲啊！',
  '维尼这脚太漂亮了 🔥',
  '摩洛哥防守真硬',
  'AI预测准不准啊？',
  '巴西冠军相！',
  '下半场加油！',
  '这比赛好看',
  '点球稳！',
  '头球牛逼',
  '美加墨世界杯太燃了',
  '巴西后防有点慌',
  '求稳别浪',
  '控球率碾压',
  '这波反击可惜了',
  '门将神扑！',
  '裁判这哨偏了吧',
  '这球都不进？？',
  '巴西配合太流畅了',
  '摩洛哥精神可嘉',
  'VAR 呢？？',
  '这传球骚啊',
  '射门靴忘带了是吧',
  '桑巴足球就是好看',
  '别龟缩了攻出来',
  '这支巴西队有冠军相',
  '摩洛哥反击速度真快',
  '这个任意球位置绝佳',
  '角球机会来了',
  '换人换人！',
  '守住守住',
]

/* ===== 实时比赛统计 ===== */
export interface MatchStats {
  possession: [number, number]   // [home%, away%]
  shots: [number, number]        // 射门
  shotsOnTarget: [number, number]
  corners: [number, number]
  fouls: [number, number]
  yellowCards: [number, number]
}

export const initialStats: MatchStats = {
  possession: [50, 50],
  shots: [0, 0],
  shotsOnTarget: [0, 0],
  corners: [0, 0],
  fouls: [0, 0],
  yellowCards: [0, 0],
}

export const matchDates = [
  { date: '6月13日', weekday: '周五', key: '06-13' },
  { date: '6月14日', weekday: '周六', key: '06-14' },
  { date: '6月15日', weekday: '周日', key: '06-15' },
  { date: '6月16日', weekday: '周一', key: '06-16' },
  { date: '6月17日', weekday: '周二', key: '06-17' },
  { date: '6月18日', weekday: '周三', key: '06-18' },
  { date: '6月19日', weekday: '周四', key: '06-19' },
]
