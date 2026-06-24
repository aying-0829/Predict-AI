import { NextResponse } from 'next/server'
import { fetchWorldCupGames } from '@/lib/footballApi'
import { getRealCompletedMatches } from '@/lib/worldCupRealData'

const TEAM_NAME_CN: Record<string, string> = {
  'Mexico': '墨西哥', 'South Africa': '南非', 'South Korea': '韩国', 'Czech Republic': '捷克',
  'Canada': '加拿大', 'Bosnia and Herzegovina': '波黑', 'Qatar': '卡塔尔', 'Switzerland': '瑞士',
  'Brazil': '巴西', 'Morocco': '摩洛哥', 'Haiti': '海地', 'Scotland': '苏格兰',
  'United States': '美国', 'Paraguay': '巴拉圭', 'Australia': '澳大利亚', 'Turkey': '土耳其',
  'Germany': '德国', 'Ivory Coast': '科特迪瓦', 'Ecuador': '厄瓜多尔', 'Curaçao': '库拉索',
  'Netherlands': '荷兰', 'Japan': '日本', 'Sweden': '瑞典', 'Tunisia': '突尼斯',
  'Belgium': '比利时', 'Egypt': '埃及', 'Iran': '伊朗', 'New Zealand': '新西兰',
  'Spain': '西班牙', 'Cape Verde': '佛得角', 'Saudi Arabia': '沙特阿拉伯', 'Uruguay': '乌拉圭',
  'France': '法国', 'Senegal': '塞内加尔', 'Iraq': '伊拉克', 'Norway': '挪威',
  'Argentina': '阿根廷', 'Algeria': '阿尔及利亚', 'Austria': '奥地利', 'Jordan': '约旦',
  'Portugal': '葡萄牙', 'Democratic Republic of the Congo': '刚果(金)', 'Uzbekistan': '乌兹别克斯坦', 'Colombia': '哥伦比亚',
  'England': '英格兰', 'Croatia': '克罗地亚', 'Ghana': '加纳', 'Panama': '巴拿马',
}

function getStatus(raw: any): 'completed' | 'live' | 'upcoming' {
  const finished = raw.finished || raw.time_elapsed || raw.status || ''
  const s = String(finished).toLowerCase()
  if (s === 'true' || s === 'finished' || s.includes('ft') || s.includes('ended') || s.includes('finish')) return 'completed'
  if (s.includes('live') || s.includes('ongoing') || s.includes('in_play')) return 'live'
  return 'upcoming'
}

export async function GET() {
  try {
    const rawGames = await fetchWorldCupGames()
    if (rawGames && rawGames.length > 0) {
      // 解析 local_date: "06/11/2026 13:00" → date + time
      const matches = rawGames.map((g: any) => {
        const dateStr = g.local_date || g.date || ''
        let date = '', time = ''
        if (dateStr.includes(' ')) {
          const parts = dateStr.split(' ')
          date = parts[0]
          time = parts[1]
        }
        const home = TEAM_NAME_CN[g.home_team_name_en] || g.home_team_name_en || g.home_team || 'Unknown'
        const away = TEAM_NAME_CN[g.away_team_name_en] || g.away_team_name_en || g.away_team || 'Unknown'
        const hs = g.home_score != null ? Number(g.home_score) : undefined
        const as = g.away_score != null ? Number(g.away_score) : undefined
        return {
          id: g.id || g._id,
          group: g.group || '',
          home,
          away,
          homeFlag: g.fifa_code_home || '',
          awayFlag: g.fifa_code_away || '',
          homeScore: isNaN(hs as number) ? undefined : hs,
          awayScore: isNaN(as as number) ? undefined : as,
          date,
          time,
          stadium: g.stadium || '',
          city: '',
          status: getStatus(g),
        }
      })
      return NextResponse.json(matches)
    }
  } catch (e) {
    console.error('[world-cup/matches]', e)
  }
  return NextResponse.json(getRealCompletedMatches())
}
