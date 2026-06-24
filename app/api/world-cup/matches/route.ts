import { NextResponse } from 'next/server'

const matches = [
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

export async function GET() {
  return NextResponse.json(matches)
}
