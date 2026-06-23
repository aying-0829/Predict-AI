// Match data shared across all tabs
export const MATCH_INFO = {
  league: '世界杯小组赛 J组 第2轮',
  date: '今天 01:00',
  homeTeam: '阿根廷',
  homeRank: 1,
  homeFlag: '🇦🇷',
  awayTeam: '奥地利',
  awayRank: 24,
  awayFlag: '🇦🇹',
  homeScore: 2,
  awayScore: 0,
  status: '已结束',
} as const

export const TABS = [
  { key: 'analysis', label: '分析' },
  { key: 'lineup', label: '阵容' },
  { key: 'chat', label: '聊天' },
  { key: 'rating', label: '球员评分' },
  { key: 'events', label: '赛况' },
  { key: 'stats', label: '统计' },
  { key: 'odds', label: '指数' },
  { key: 'video', label: '视频' },
] as const

export type TabKey = (typeof TABS)[number]['key']

// Analysis tab data
export const ARGENTINA_RECENT = [
  { date: '2026-06-17', event: '世界杯', match: '阿根廷 3-0 阿联酋', handicap: '1.5 赢盘', total: '2.75 大球' },
  { date: '2026-06-10', event: '国际友谊', match: '阿根廷 3-0 冰岛', handicap: '1.75 赢盘', total: '2.75 大球' },
  { date: '2026-06-07', event: '国际友谊', match: '阿根廷 2-0 洪都拉斯', handicap: '2.25 赢盘', total: '3.25 小球' },
  { date: '2026-04-01', event: '国际友谊', match: '阿根廷 5-0 赞比亚', handicap: '3.0 赢盘', total: '3.5 大球' },
  { date: '2026-03-28', event: '国际友谊', match: '阿根廷 2-1 毛里塔尼亚', handicap: '3.5 输盘', total: '4.25 小球' },
  { date: '2025-11-15', event: '国际友谊', match: '安哥拉 0-2 阿根廷', handicap: '-1.75 赢盘', total: '3.0 小球' },
]

export const AUSTRIA_RECENT = [
  { date: '2026-06-17', event: '世界杯', match: '奥地利 1-1 瑞士', handicap: '0.25 赢盘', total: '2.25 小球' },
  { date: '2026-06-10', event: '国际友谊', match: '奥地利 2-1 塞尔维亚', handicap: '-0.5 赢盘', total: '2.5 大球' },
  { date: '2026-06-05', event: '国际友谊', match: '奥地利 0-2 法国', handicap: '1.0 输盘', total: '2.75 小球' },
  { date: '2026-03-28', event: '国际友谊', match: '奥地利 3-0 摩尔多瓦', handicap: '-2.0 赢盘', total: '3.0 大球' },
  { date: '2026-03-23', event: '欧国联', match: '奥地利 1-0 斯洛伐克', handicap: '-0.75 赢半', total: '2.25 小球' },
  { date: '2025-11-18', event: '欧国联', match: '挪威 2-1 奥地利', handicap: '0.5 输盘', total: '2.75 大球' },
]

export const ARGENTINA_STATS = { winRate: 100, handicapRate: 67, overRate: 50 }
export const AUSTRIA_STATS = { winRate: 50, handicapRate: 50, overRate: 33 }

// Lineup tab data
export const REFEREE_INFO = { name: '阿敏·穆罕默德·奥马尔', number: 6 }
export const VENUE = '达拉斯体育场'
export const LINEUP_VALUE = '41900万欧'
export const FORMATION = '4-4-2'

export const ARGENTINA_LINEUP = {
  goalkeeper: [{ number: 23, name: '达米安·马丁内斯' }],
  defenders: [
    { number: 7, name: '罗德里戈·德保罗' },
    { number: 25, name: '莱安德罗·帕雷德斯' },
    { number: 24, name: '尼古拉斯·塔利亚菲科' },
    { number: 16, name: '纳坦·阿亚拉' },
  ],
  midfielders: [
    { number: 26, name: '纳韦尔·莫利纳' },
    { number: 13, name: '克里斯蒂安·罗梅罗' },
    { number: 6, name: '罗德里戈·德保罗' },
    { number: 25, name: '恩佐·费尔南德斯' },
  ],
  forwards: [
    { number: 23, name: '达米安·马丁内斯' },
  ],
}

export const AUSTRIA_LINEUP = {
  goalkeeper: [{ number: 1, name: '帕特里克·彭茨' }],
  defenders: [
    { number: 5, name: '斯特凡·波施' },
    { number: 16, name: '菲利普·穆维内' },
    { number: 3, name: '凯文·丹索' },
    { number: 2, name: '马克西米利安·沃贝尔' },
  ],
  midfielders: [
    { number: 6, name: '尼古拉斯·塞瓦尔德' },
    { number: 10, name: '克里斯托夫·鲍姆加特纳' },
    { number: 20, name: '康拉德·莱默尔' },
    { number: 9, name: '马塞尔·萨比策' },
  ],
  forwards: [
    { number: 7, name: '马尔科·阿瑙托维奇' },
    { number: 11, name: '迈克尔·格雷戈里奇' },
  ],
}

// Chat tab data
export const CHAT_MESSAGES = [
  { user: '151****60', content: '阿根廷加油' },
  { user: '徐硕03', content: '奥地利加油' },
  { user: '136****391', content: '3：0都没了' },
  { user: 'A250c8ff', content: '!!!!!!!!' },
  { user: '136****889', content: '阿根廷加油' },
  { user: 'fakak', content: '吃惊勺' },
  { user: '百度***67', content: '阿根廷加油' },
  { user: 'ben王小', content: '阿根廷加油' },
  { user: '153****667', content: '阿根廷加油' },
  { user: '福马大仙', content: '造神计划' },
  { user: '13***66', content: '2队随便进哪个都行' },
  { user: '老夜人', content: '感觉小组赛太顺的球队到了淘汰赛容易出事' },
  { user: '159****299', content: '阿根廷加油' },
  { user: '136****549', content: '阿根廷加油' },
  { user: '136****539', content: '[捂脸]' },
  { user: '吉吉圣人B', content: '阿根廷加油' },
  { user: '吉吉圣人B', content: '阿根廷加油' },
  { user: '百度****92', content: '阿根廷加油' },
  { user: 'kiiuicnqag', content: '梅西永远的球王！' },
  { user: '151****777', content: '我在百度看世界杯' },
]

// Rating tab data
export const ARGENTINA_RATINGS = [
  {
    name: '利昂内尔·梅西',
    goals: 2,
    assists: 0,
    rating: 8.8,
    votes: 4400,
    comment: '太帅了，38岁还有这个状态，踢满全场，最后还能在奥地利的禁区内游龙',
  },
  {
    name: '达米安·马丁内斯',
    goals: 0,
    assists: 0,
    rating: 8.9,
    votes: 840,
    comment: '任意球好扑',
  },
  {
    name: '法昆多·梅迪纳',
    goals: 0,
    assists: 1,
    rating: 8.8,
    votes: 478,
    comment: '在左后卫位置上的发挥非常关键，防守端有一张牌，进攻端直接参与了打破僵局的进球，彰显了教练的信任',
  },
  {
    name: '劳塔罗·马丁内斯',
    goals: 0,
    assists: 0,
    rating: 8.6,
    votes: 439,
    comment: '比某某球员强多了，会回防还能制造威胁',
  },
  {
    name: '胡利安·阿尔瓦雷斯',
    goals: 0,
    assists: 0,
    rating: 8.7,
    votes: 394,
    comment: '梅西，梅西你快醒醒 小梅西，咱不争气，还要你老人家亲自上阵',
  },
]

// Events tab data
export const MATCH_EVENTS = [
  { minute: 1, icon: '📋', text: '裁判吹响全场比赛开始的哨声，阿根廷率先开球', type: 'info' },
  { minute: 8, icon: '📊', text: '阿根廷前场打出精妙配合，梅西禁区前沿远射被门将扑出', type: 'chance' },
  { minute: 15, icon: '⚽', text: '进球！法昆多·梅迪纳左路传中，梅西禁区内头球破门！阿根廷 1-0 奥地利', type: 'goal' },
  { minute: 23, icon: '🟡', text: '黄牌：奥地利 凯文·丹索 铲球犯规', type: 'card' },
  { minute: 31, icon: '📋', text: '奥地利获得前场任意球机会，萨比策主罚偏出', type: 'info' },
  { minute: 38, icon: '📊', text: '阿根廷快速反击，阿尔瓦雷斯单刀被门将挡出底线', type: 'chance' },
  { minute: 45, icon: '⏸', text: '上半场比赛结束，阿根廷暂时1-0领先奥地利', type: 'ht' },
  { minute: 46, icon: '📋', text: '下半场比赛开始，奥地利开球', type: 'info' },
  { minute: 52, icon: '🟡', text: '黄牌：阿根廷 克里斯蒂安·罗梅罗 拉拽犯规', type: 'card' },
  { minute: 58, icon: '📊', text: '奥地利加强攻势，阿瑙托维奇禁区外远射被马丁内斯没收', type: 'chance' },
  { minute: 67, icon: '⚽', text: '进球！梅西主罚点球命中，完成梅开二度！阿根廷 2-0 奥地利', type: 'goal' },
  { minute: 72, icon: '🟡', text: '黄牌：阿根廷 莱安德罗·帕雷德斯 战术犯规', type: 'card' },
  { minute: 78, icon: '📋', text: '奥地利换人：鲍姆加特纳↓ 维默尔↑', type: 'info' },
  { minute: 82, icon: '🟡', text: '黄牌：奥地利 康拉德·莱默尔 铲球犯规', type: 'card' },
  { minute: 85, icon: '📋', text: '阿根廷换人：阿尔瓦雷斯↓ 迪马利亚↑', type: 'info' },
  { minute: 90, icon: '⏱', text: '全场比赛结束，阿根廷2-0战胜奥地利，小组赛两连胜提前出线！', type: 'ft' },
]

// Stats tab data
export const MATCH_STATS = [
  { label: '进球', home: 2, away: 0 },
  { label: '控球率', home: 54, away: 46, isPercent: true },
  { label: '进攻', home: 82, away: 114 },
  { label: '危险进攻', home: 33, away: 59 },
  { label: '射门', home: 5, away: 1 },
  { label: '射正', home: 4, away: 4 },
  { label: '角球', home: 1, away: 3 },
  { label: '点球', home: 1, away: 0 },
  { label: '黄牌', home: 2, away: 2 },
  { label: '红牌', home: 0, away: 0 },
]

// Odds tab data
export const ODDS_DATA = {
  asian: [
    { company: '皇冠', home: 0.90, handicap: '0.5', away: 0.98 },
    { company: '澳门', home: 0.88, handicap: '0.5', away: 0.96 },
    { company: 'bet365', home: 0.91, handicap: '0.5/1', away: 0.95 },
    { company: 'William Hill', home: 0.89, handicap: '0.5', away: 0.97 },
    { company: '立博', home: 0.92, handicap: '0.5/1', away: 0.94 },
  ],
  euro: [
    { company: '皇冠', home: 1.85, draw: 3.50, away: 4.20 },
    { company: '澳门', home: 1.82, draw: 3.45, away: 4.15 },
    { company: 'bet365', home: 1.88, draw: 3.55, away: 4.25 },
    { company: 'William Hill', home: 1.83, draw: 3.48, away: 4.18 },
    { company: '立博', home: 1.87, draw: 3.52, away: 4.22 },
  ],
  overUnder: [
    { company: '皇冠', over: 0.92, total: '2.5', under: 0.94 },
    { company: '澳门', over: 0.90, total: '2.5', under: 0.92 },
    { company: 'bet365', over: 0.93, total: '2.5/3', under: 0.91 },
    { company: 'William Hill', over: 0.91, total: '2.5', under: 0.93 },
    { company: '立博', over: 0.94, total: '2.5/3', under: 0.90 },
  ],
}

// Video tab data
export const VIDEO_ITEMS = [
  { title: '阿根廷2-0奥地利 全场集锦', source: '央视体育', duration: '08:24' },
  { title: '梅西梅开二度 精彩进球回放', source: 'PP体育', duration: '03:15' },
  { title: '赛后新闻发布会：阿根廷主帅谈比赛', source: '环球体育', duration: '05:42' },
  { title: '奥地利vs阿根廷 上半场精华', source: '腾讯体育', duration: '04:08' },
  { title: '梅西38岁仍闪耀世界杯 传奇继续', source: '足球周刊', duration: '02:56' },
  { title: '世界杯J组积分榜分析：阿根廷提前出线', source: '央视分析', duration: '06:30' },
]
