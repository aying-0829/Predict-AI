import { NextRequest, NextResponse } from 'next/server'

const AI_API_URL = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions'
const AI_API_KEY = process.env.AI_API_KEY || ''
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini'

const SYSTEM_PROMPT = `你是 Predict AI 的智能预测助手。你基于数据分析和统计模型，为用户提供足球/篮球赛事预测分析、双色球/大乐透等彩票号码分析、竞彩投注策略建议。回答原则：所有预测仅供娱乐参考，不构成投注建议；基于统计概率模型，明确标注置信度；对彩票类问题强调历史数据无法预测独立随机事件；回答简洁专业`

const mockResponses: Record<string, string[]> = {
  premier: [
    '根据当前数据模型分析，英超本轮**阿森纳**主场对阵水晶宫的胜率约为 **72%**。阿森纳主场近5场4胜1平，进攻端状态火热。但需注意水晶宫近期防守有所提升，建议关注赛前首发名单。',
    '曼城近期状态分析：近5场比赛3胜1平1负，进攻端（场均1.8球）略有下滑但防守依然稳健（场均失0.6球）。哈兰德进球效率有所回落，但德布劳内回归后会明显改善。对阵中下游球队依然有较高胜率，但对阵前6球队需谨慎。',
    '利物浦近期的表现呈现上升趋势，萨拉赫和努涅斯连线效率提升。不过客场作战能力依然是短板，过去3个客场仅1胜。建议关注利物浦vs客场的对阵模式。',
  ],
  laliga: [
    '皇马 vs 巴萨实力对比：皇马本赛季攻防两端数据更均衡（xG 2.1 vs 1.8），贝林厄姆融入度极高。巴萨在控球率方面仍占优势但终结能力有所下滑。综合来看，皇马在伯纳乌胜率约 **58%**，平局概率 **25%**。',
    '马竞近期防守端表现稳健，西蒙尼的3-5-2阵型运转良好。格列兹曼状态出色，近3场贡献2球1助攻。对阵中下游球队胜率约70%。',
  ],
  lottery: [
    '根据近500期双色球数据分析，目前最热的红球号码为 **05、11、18、23、27、33**，蓝球最热为 **09**。冷号方面，红球 **02、15、29** 已分别遗漏 18、22、19 期，值得关注。建议采用 3热+3冷 的选号策略。',
    '大乐透近期号码分布：前区热号 **07、14、22、30、35**，后区热号 **03、08**。区间分布来看，第二区间（11-20）近期出现频率最高，占比约35%。奇偶比方面，3:2 和 2:3 出现概率最高。',
    '从号码遗漏表来看，双色球蓝球 **12** 已遗漏 67 期，创下近3年最长遗漏纪录。虽然历史数据无法预测未来，但从统计回归角度，该号码的"补出"概率在统计学意义上有所上升。请理性参考。',
  ],
  default: [
    '这是一个很好的问题！根据我们的AI预测模型，结合近期比赛数据和球队状态，我建议关注主场优势明显的球队。需要我分析具体的联赛或球队吗？',
    '感谢你的提问。目前的预测模型基于深度学习算法，综合考量了历史战绩、球员状态、伤病情况等多维度数据。如果你有具体的比赛或球队想了解，请告诉我！',
    '从数据趋势来看，近期主流联赛的平局概率有所上升（从平均22%升至27%），这可能与赛季中期球队体能分配有关。建议在投注策略中适当提高平局权重。',
  ],
}

function getAIResponse(message: string): string {
  const msg = message
  if (msg.includes('英超') || msg.includes('premier') || msg.includes('Premier')) {
    const arr = mockResponses.premier
    return arr[Math.floor(Math.random() * arr.length)]
  }
  if (msg.includes('西甲') || msg.includes('laliga') || msg.includes('LaLiga') || msg.includes('皇马') || msg.includes('巴萨') || msg.includes('马竞')) {
    const arr = mockResponses.laliga
    return arr[Math.floor(Math.random() * arr.length)]
  }
  if (msg.includes('曼城') || msg.includes('man city') || msg.includes('Man City')) { return mockResponses.premier[1] }
  if (msg.includes('双色球') || msg.includes('大乐透') || msg.includes('彩票') || msg.includes('lottery') || msg.includes('Lottery') || msg.includes('号码')) {
    const arr = mockResponses.lottery
    return arr[Math.floor(Math.random() * arr.length)]
  }
  if (msg.includes('对比') || msg.includes('versus') || msg.includes('vs') || msg.includes('VS')) { return mockResponses.laliga[0] }
  return mockResponses.default[Math.floor(Math.random() * mockResponses.default.length)]
}

type Intent = 'lottery' | 'sports' | 'general'

function parseIntent(message: string): Intent {
  const lotteryKeywords = ['双色球', '大乐透', '彩票', '选号', '号码', '开奖', '福彩', '体彩', '3d', '排列', 'ssq', 'dlt', 'SSQ', 'DLT']
  const sportsKeywords = ['英超', '西甲', '意甲', '德甲', '法甲', '欧冠', '世界杯', '预测', '比赛', '胜率', '对阵',
    'premier', 'laliga', 'bundesliga', 'serie', 'league', 'match', 'vs', '比分', '足球', '篮球',
    'Premier', 'LaLiga', 'Bundesliga', 'Serie', 'League', 'Match', 'VS']

  const msg = message
  if (lotteryKeywords.some(k => msg.includes(k))) return 'lottery'
  if (sportsKeywords.some(k => msg.includes(k))) return 'sports'
  return 'general'
}

async function callRealAI(messages: { role: string; content: string }[]): Promise<string | null> {
  if (!AI_API_KEY) return null
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(AI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${AI_API_KEY}` },
      body: JSON.stringify({ model: AI_MODEL, messages, max_tokens: 800, temperature: 0.7 }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    if (!res.ok) return null
    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content
    return typeof content === 'string' && content.trim().length > 0 ? content.trim() : null
  } catch {
    clearTimeout(timeoutId)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message } = body as { message: string }
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ code: 1, message: '消息不能为空' }, { status: 400 })
    }
    const trimmedMessage = message.trim()
    const intent = parseIntent(trimmedMessage)
    let enhancedPrompt = trimmedMessage

    if (intent === 'lottery') {
      try {
        const { fetchLotteryHistory } = await import('@/lib/lotteryApi')
        const { analyzeHotCold, generateRecommendations } = await import('@/lib/engine/lottery')
        const draws = await fetchLotteryHistory('ssq', 50)
        const isMock = !draws || draws.length === 0
        const effectiveDraws = isMock
          ? await (async () => { const { mockLotteryDraws } = await import('@/lib/services'); return mockLotteryDraws(50); })()
          : draws
        if (effectiveDraws && effectiveDraws.length > 0) {
          const analysis = analyzeHotCold(effectiveDraws, 33, 16)
          const recs = generateRecommendations(analysis, 6, 1)
          const hotNums = analysis.hotCold.hot.filter(h => h.type === 'red').slice(0, 6).map(h => h.number).join(',')
          const coldNums = analysis.hotCold.cold.filter(c => c.type === 'red').slice(0, 6).map(c => c.number).join(',')
          const dataSource = isMock ? '模拟' : '真实'
          enhancedPrompt = `用户问题: ${trimmedMessage}\n\n基于${dataSource}双色球近50期开奖数据的引擎分析结果:\n- 热号: ${hotNums}\n- 冷号: ${coldNums}\n- 区间分布: 一区${analysis.zoneDist.zone1}% 二区${analysis.zoneDist.zone2}% 三区${analysis.zoneDist.zone3}%\n- 奇偶比: 奇数${analysis.oddEven.odd}次 偶数${analysis.oddEven.even}次\n- AI推荐方案1: ${recs[0].reds.join(',')} | ${recs[0].blues.join(',')} (置信度${recs[0].confidence}%)\n- AI推荐方案2: ${recs[1]?.reds.join(',')} | ${recs[1]?.blues.join(',')} (置信度${recs[1]?.confidence}%)\n\n请基于以上${dataSource}统计数据回答用户问题，给出专业的号码分析和推荐。强调预测仅供娱乐参考。${isMock ? '\n（注：当前基于模拟数据进行分析，仅供参考娱乐）' : ''}`
        }
      } catch { /* use raw message */ }
    }

    if (intent === 'sports') {
      try {
        const { predictMatch } = await import('@/lib/engine/sports')
        const pred = predictMatch({ homeTeam: '主队', awayTeam: '客队' })
        enhancedPrompt = `用户问题: ${trimmedMessage}\n\n基于ELO评级+泊松分布的体育预测引擎分析框架:\n- 主胜概率约${pred.homeWinProb}%, 平局约${pred.drawProb}%, 客胜约${pred.awayWinProb}%\n- 预期进球: 主队${pred.expectedGoals.home} vs 客队${pred.expectedGoals.away}\n- AI预测比分: ${pred.scorePrediction} (置信度${pred.confidence}%)\n\n请结合以上统计模型框架，分析用户询问的赛事对阵形势，给出专业预测。强调预测仅供娱乐参考，不构成投注建议。`
      } catch { /* use raw message */ }
    }

    let responseContent: string
    const aiResult = await callRealAI([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: enhancedPrompt },
    ])

    if (aiResult) {
      responseContent = aiResult
    } else {
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200))
      responseContent = getAIResponse(trimmedMessage)
    }

    return NextResponse.json({
      code: 0,
      data: { role: 'assistant', content: responseContent, timestamp: Date.now() },
    })
  } catch {
    return NextResponse.json({ code: 1, message: 'AI 服务暂时不可用' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    code: 0,
    data: {
      quickQuestions: [
        { id: 'q1', text: '今天英超胜率最高的比赛是？' },
        { id: 'q2', text: '分析一下曼城最近状态' },
        { id: 'q3', text: '双色球最热的号码是哪些？' },
        { id: 'q4', text: '对比一下皇马和巴萨的实力' },
      ],
      context: {
        hotMatches: [
          { home: '阿森纳', away: '水晶宫', league: '英超', time: '2026-06-17 22:00' },
          { home: '皇马', away: '巴萨', league: '西甲', time: '2026-06-18 03:00' },
          { home: '拜仁', away: '多特蒙德', league: '德甲', time: '2026-06-18 00:30' },
        ],
        lotteryInfo: {
          ssq: '双色球第2026066期，奖池 18.5 亿',
          dlt: '大乐透第2026066期，奖池 12.3 亿',
        },
      },
    },
  })
}
