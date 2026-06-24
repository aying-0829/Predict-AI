import { NextResponse } from 'next/server'
import { fetchWorldCupGroups } from '@/lib/footballApi'

// ── Fallback Standings (hardcoded, works even when API is down) ──
const FALLBACK_STANDINGS: Record<string, any[]> = {
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const group = searchParams.get('group')

  try {
    const groupsRaw = await fetchWorldCupGroups()
    if (groupsRaw && groupsRaw.length > 0) {
      const result: Record<string, any[]> = {}
      for (const g of groupsRaw) {
        const name = g.name || g.group || '?'
        const teams = (g.teams || g.standings || []).map((t: any, i: number) => ({
          pos: i + 1,
          team: t.name || t.team || `Team ${i + 1}`,
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
        teams.sort((a: any, b: any) => b.pts - a.pts || parseInt(b.gd) - parseInt(a.gd) || parseInt(b.gf) - parseInt(a.gf))
        teams.forEach((t: any, i: number) => { t.pos = i + 1 })
        result[name.toUpperCase()] = teams
      }

      if (group) return NextResponse.json(result[group.toUpperCase()] || [])
      return NextResponse.json(result)
    }
  } catch (e) {
    console.error('[world-cup/standings] API error:', e)
  }

  // Fallback
  if (group) {
    return NextResponse.json(FALLBACK_STANDINGS[group.toUpperCase()] || [])
  }
  return NextResponse.json(FALLBACK_STANDINGS)
}
