import { NextResponse } from 'next/server'
import { fetchWorldCupGames } from '@/lib/footballApi'

// ── Fallback Matches (36 completed matches, hardcoded) ──
const FALLBACK_MATCHES_BY_GROUP: Record<string, any[]> = {
  A: [
    { id: 'A1', group: 'A', home: '墨西哥', away: '韩国', homeFlag: 'MX', awayFlag: 'KR', homeScore: 2, awayScore: 0, date: '2026-06-12', time: '17:00', stadium: '墨西哥城阿兹台克球场', city: '墨西哥城', status: 'completed' },
    { id: 'A2', group: 'A', home: '捷克', away: '南非', homeFlag: 'CZ', awayFlag: 'ZA', homeScore: 1, awayScore: 1, date: '2026-06-12', time: '20:00', stadium: '瓜达拉哈拉阿克伦球场', city: '瓜达拉哈拉', status: 'completed' },
    { id: 'A3', group: 'A', home: '墨西哥', away: '南非', homeFlag: 'MX', awayFlag: 'ZA', homeScore: 1, awayScore: 0, date: '2026-06-19', time: '17:00', stadium: '墨西哥城体育场', city: '墨西哥城', status: 'completed' },
    { id: 'A4', group: 'A', home: '捷克', away: '韩国', homeFlag: 'CZ', awayFlag: 'KR', homeScore: 1, awayScore: 2, date: '2026-06-19', time: '20:00', stadium: '瓜达拉哈拉体育场', city: '瓜达拉哈拉', status: 'completed' },
  ],
  B: [
    { id: 'B1', group: 'B', home: '加拿大', away: '卡塔尔', homeFlag: 'CA', awayFlag: 'QA', homeScore: 1, awayScore: 1, date: '2026-06-13', time: '14:00', stadium: '多伦多BMO球场', city: '多伦多', status: 'completed' },
    { id: 'B2', group: 'B', home: '瑞士', away: '波黑', homeFlag: 'CH', awayFlag: 'BA', homeScore: 1, awayScore: 1, date: '2026-06-13', time: '17:00', stadium: '蒙特利尔奥林匹克球场', city: '蒙特利尔', status: 'completed' },
    { id: 'B3', group: 'B', home: '加拿大', away: '波黑', homeFlag: 'CA', awayFlag: 'BA', homeScore: 6, awayScore: 0, date: '2026-06-20', time: '14:00', stadium: '多伦多体育场', city: '多伦多', status: 'completed' },
    { id: 'B4', group: 'B', home: '瑞士', away: '卡塔尔', homeFlag: 'CH', awayFlag: 'QA', homeScore: 4, awayScore: 1, date: '2026-06-20', time: '17:00', stadium: '蒙特利尔体育场', city: '蒙特利尔', status: 'completed' },
  ],
  C: [
    { id: 'C1', group: 'C', home: '巴西', away: '海地', homeFlag: 'BR', awayFlag: 'HT', homeScore: 1, awayScore: 1, date: '2026-06-13', time: '20:00', stadium: '纽约大都会球场', city: '纽约', status: 'completed' },
    { id: 'C2', group: 'C', home: '摩洛哥', away: '苏格兰', homeFlag: 'MA', awayFlag: 'GB', homeScore: 1, awayScore: 1, date: '2026-06-14', time: '14:00', stadium: '波士顿吉列球场', city: '波士顿', status: 'completed' },
    { id: 'C3', group: 'C', home: '巴西', away: '苏格兰', homeFlag: 'BR', awayFlag: 'GB', homeScore: 3, awayScore: 0, date: '2026-06-20', time: '20:00', stadium: '纽约新泽西体育场', city: '纽约', status: 'completed' },
    { id: 'C4', group: 'C', home: '摩洛哥', away: '海地', homeFlag: 'MA', awayFlag: 'HT', homeScore: 1, awayScore: 0, date: '2026-06-20', time: '20:00', stadium: '波士顿体育场', city: '波士顿', status: 'completed' },
  ],
  D: [
    { id: 'D1', group: 'D', home: '美国', away: '澳大利亚', homeFlag: 'US', awayFlag: 'AU', homeScore: 4, awayScore: 1, date: '2026-06-14', time: '17:00', stadium: '洛杉矶玫瑰碗球场', city: '洛杉矶', status: 'completed' },
    { id: 'D2', group: 'D', home: '巴拉圭', away: '土耳其', homeFlag: 'PY', awayFlag: 'TR', homeScore: 1, awayScore: 0, date: '2026-06-14', time: '20:00', stadium: '温哥华BC球场', city: '温哥华', status: 'completed' },
    { id: 'D3', group: 'D', home: '美国', away: '土耳其', homeFlag: 'US', awayFlag: 'TR', homeScore: 2, awayScore: 0, date: '2026-06-21', time: '14:00', stadium: '洛杉矶体育场', city: '洛杉矶', status: 'completed' },
    { id: 'D4', group: 'D', home: '巴拉圭', away: '澳大利亚', homeFlag: 'PY', awayFlag: 'AU', homeScore: 1, awayScore: 0, date: '2026-06-21', time: '17:00', stadium: '温哥华BC体育场', city: '温哥华', status: 'completed' },
  ],
  E: [
    { id: 'E1', group: 'E', home: '德国', away: '库拉索', homeFlag: 'DE', awayFlag: 'CW', homeScore: 7, awayScore: 1, date: '2026-06-14', time: '14:00', stadium: '慕尼黑安联球场', city: '慕尼黑', status: 'completed' },
    { id: 'E2', group: 'E', home: '科特迪瓦', away: '厄瓜多尔', homeFlag: 'CI', awayFlag: 'EC', homeScore: 1, awayScore: 0, date: '2026-06-14', time: '17:00', stadium: '柏林奥林匹克球场', city: '柏林', status: 'completed' },
    { id: 'E3', group: 'E', home: '德国', away: '厄瓜多尔', homeFlag: 'DE', awayFlag: 'EC', homeScore: 2, awayScore: 1, date: '2026-06-21', time: '20:00', stadium: '慕尼黑安联球场', city: '慕尼黑', status: 'completed' },
    { id: 'E4', group: 'E', home: '科特迪瓦', away: '库拉索', homeFlag: 'CI', awayFlag: 'CW', homeScore: 0, awayScore: 0, date: '2026-06-21', time: '20:00', stadium: '柏林奥林匹克球场', city: '柏林', status: 'completed' },
  ],
  F: [
    { id: 'F1', group: 'F', home: '荷兰', away: '日本', homeFlag: 'NL', awayFlag: 'JP', homeScore: 2, awayScore: 2, date: '2026-06-14', time: '20:00', stadium: '阿姆斯特丹竞技场', city: '阿姆斯特丹', status: 'completed' },
    { id: 'F2', group: 'F', home: '瑞典', away: '突尼斯', homeFlag: 'SE', awayFlag: 'TN', homeScore: 5, awayScore: 1, date: '2026-06-15', time: '14:00', stadium: '斯德哥尔摩友谊竞技场', city: '斯德哥尔摩', status: 'completed' },
    { id: 'F3', group: 'F', home: '荷兰', away: '突尼斯', homeFlag: 'NL', awayFlag: 'TN', homeScore: 5, awayScore: 1, date: '2026-06-22', time: '14:00', stadium: '阿姆斯特丹竞技场', city: '阿姆斯特丹', status: 'completed' },
    { id: 'F4', group: 'F', home: '日本', away: '瑞典', homeFlag: 'JP', awayFlag: 'SE', homeScore: 4, awayScore: 0, date: '2026-06-22', time: '17:00', stadium: '埼玉体育场', city: '埼玉', status: 'completed' },
  ],
  G: [
    { id: 'G1', group: 'G', home: '比利时', away: '埃及', homeFlag: 'BE', awayFlag: 'EG', homeScore: 1, awayScore: 1, date: '2026-06-15', time: '17:00', stadium: '布鲁塞尔体育场', city: '布鲁塞尔', status: 'completed' },
    { id: 'G2', group: 'G', home: '伊朗', away: '新西兰', homeFlag: 'IR', awayFlag: 'NZ', homeScore: 2, awayScore: 2, date: '2026-06-15', time: '20:00', stadium: '德黑兰体育场', city: '德黑兰', status: 'completed' },
  ],
  H: [
    { id: 'H1', group: 'H', home: '西班牙', away: '佛得角', homeFlag: 'ES', awayFlag: 'CV', homeScore: 0, awayScore: 0, date: '2026-06-16', time: '14:00', stadium: '巴塞罗那诺坎普', city: '巴塞罗那', status: 'completed' },
    { id: 'H2', group: 'H', home: '沙特阿拉伯', away: '乌拉圭', homeFlag: 'SA', awayFlag: 'UY', homeScore: 1, awayScore: 1, date: '2026-06-16', time: '17:00', stadium: '马德里大都会球场', city: '马德里', status: 'completed' },
  ],
  I: [
    { id: 'I1', group: 'I', home: '法国', away: '塞内加尔', homeFlag: 'FR', awayFlag: 'SN', homeScore: 3, awayScore: 1, date: '2026-06-16', time: '20:00', stadium: '巴黎法兰西球场', city: '巴黎', status: 'completed' },
    { id: 'I2', group: 'I', home: '挪威', away: '伊拉克', homeFlag: 'NO', awayFlag: 'IQ', homeScore: 4, awayScore: 1, date: '2026-06-17', time: '14:00', stadium: '奥斯陆体育场', city: '奥斯陆', status: 'completed' },
  ],
  J: [
    { id: 'J1', group: 'J', home: '阿根廷', away: '阿尔及利亚', homeFlag: 'AR', awayFlag: 'DZ', homeScore: 3, awayScore: 0, date: '2026-06-17', time: '17:00', stadium: '布宜诺斯艾利斯纪念碑球场', city: '布宜诺斯艾利斯', status: 'completed' },
    { id: 'J2', group: 'J', home: '奥地利', away: '约旦', homeFlag: 'AT', awayFlag: 'JO', homeScore: 3, awayScore: 1, date: '2026-06-17', time: '20:00', stadium: '维也纳体育场', city: '维也纳', status: 'completed' },
  ],
  K: [
    { id: 'K1', group: 'K', home: '葡萄牙', away: '刚果(金)', homeFlag: 'PT', awayFlag: 'CD', homeScore: 1, awayScore: 1, date: '2026-06-18', time: '14:00', stadium: '里斯本光明球场', city: '里斯本', status: 'completed' },
    { id: 'K2', group: 'K', home: '哥伦比亚', away: '乌兹别克斯坦', homeFlag: 'CO', awayFlag: 'UZ', homeScore: 3, awayScore: 1, date: '2026-06-18', time: '17:00', stadium: '波哥大体育场', city: '波哥大', status: 'completed' },
  ],
  L: [
    { id: 'L1', group: 'L', home: '英格兰', away: '克罗地亚', homeFlag: 'GB', awayFlag: 'HR', homeScore: 4, awayScore: 2, date: '2026-06-18', time: '20:00', stadium: '伦敦温布利球场', city: '伦敦', status: 'completed' },
    { id: 'L2', group: 'L', home: '加纳', away: '巴拿马', homeFlag: 'GH', awayFlag: 'PA', homeScore: 1, awayScore: 0, date: '2026-06-19', time: '14:00', stadium: '阿克拉体育场', city: '阿克拉', status: 'completed' },
  ],
}

function flattenFallbackMatches(): any[] {
  const all: any[] = []
  for (const group of Object.values(FALLBACK_MATCHES_BY_GROUP)) {
    all.push(...group)
  }
  return all
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const group = searchParams.get('group')

  try {
    const wcGames = await fetchWorldCupGames()
    if (wcGames && wcGames.length > 0) {
      const mapped = wcGames.map((m: any) => ({
        id: m._id || `wc-${Math.random().toString(36).slice(2, 8)}`,
        group: (m.group || '').toUpperCase(),
        home: m.home_team || m.homeTeam || 'TBD',
        away: m.away_team || m.awayTeam || 'TBD',
        homeFlag: '',
        awayFlag: '',
        homeScore: m.home_score ?? m.homeScore ?? null,
        awayScore: m.away_score ?? m.awayScore ?? null,
        date: m.date || '',
        time: '',
        stadium: m.stadium || '',
        city: '',
        status: (() => {
          const f = m.finished
          const s = String(m.status || '').toLowerCase()
          if (typeof f === 'boolean' && f) return 'completed'
          if (s.includes('live') || s.includes('ongoing')) return 'live'
          if (s.includes('finish') || s.includes('ft') || s.includes('ended')) return 'completed'
          return 'scheduled'
        })(),
      }))

      if (group) {
        return NextResponse.json(mapped.filter((m: any) => m.group === group.toUpperCase()))
      }
      return NextResponse.json(mapped)
    }
  } catch (e) {
    console.error('[world-cup/matches] API error:', e)
  }

  // Fallback
  if (group) {
    const g = group.toUpperCase()
    return NextResponse.json(FALLBACK_MATCHES_BY_GROUP[g] || [])
  }
  return NextResponse.json(flattenFallbackMatches())
}
