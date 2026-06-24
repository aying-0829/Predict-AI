import { NextResponse } from 'next/server'
import { fetchWorldCupGroups } from '@/lib/footballApi'
import { getRealGroupStandings } from '@/lib/worldCupRealData'

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

export async function GET() {
  try {
    // 获取 groups + teams 数据
    const groupsRaw = await fetchWorldCupGroups()
    if (!groupsRaw || groupsRaw.length === 0) throw new Error('No groups')

    // 获取 teams 做名称映射
    let teamMap: Record<string, string> = {}
    try {
      const resp = await fetch('https://worldcup26.ir/get/teams')
      const teamsData = await resp.json()
      const teams = Array.isArray(teamsData) ? teamsData : (teamsData.teams || teamsData.data || [])
      for (const t of teams) {
        teamMap[t.id] = TEAM_NAME_CN[t.name_en] || t.name_en
      }
    } catch {}

    const standings: Record<string, any[]> = {}
    const groupsSorted = [...groupsRaw].sort((a, b) => (a.name || '').localeCompare(b.name || ''))

    for (const g of groupsSorted) {
      const groupName = g.name || g.group || ''
      const teams = (g.teams || g.standings || []).map((t: any) => ({
        pos: 0,
        team: teamMap[t.team_id] || TEAM_NAME_CN[t.name] || t.team || `Team ${t.team_id}`,
        flag: t.fifa_code || '',
        played: Number(t.mp || t.played || 0),
        won: Number(t.w || t.won || 0),
        drawn: Number(t.d || t.drawn || 0),
        lost: Number(t.l || t.lost || 0),
        gf: String(t.gf || 0),
        ga: String(t.ga || 0),
        gd: String(t.gd || 0),
        pts: Number(t.pts || t.points || 0),
        status: 'pending',
      }))
      .sort((a: any, b: any) => b.pts - a.pts || parseInt(b.gd) - parseInt(a.gd) || parseInt(b.gf) - parseInt(a.gf))

      teams.forEach((t: any, i: number) => { t.pos = i + 1 })
      standings[groupName] = teams
    }

    return NextResponse.json(standings)
  } catch (e) {
    console.error('[world-cup/standings]', e)
  }
  return NextResponse.json(getRealGroupStandings())
}
