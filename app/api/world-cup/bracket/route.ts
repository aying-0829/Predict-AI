import { NextResponse } from 'next/server'
import { getRealGroupStandings } from '@/lib/worldCupRealData'

interface KnockoutSlot {
  round: string
  home: string
  homeFlag: string
  away: string
  awayFlag: string
  isDecided: boolean
  aiPredict?: string
}

export async function GET() {
  const standings = getRealGroupStandings()

  // 取各组前2名，按组内排名 pos=1 第一，pos=2 第二
  const top2 = Object.entries(standings).flatMap(([group, teams]) => {
    const sorted = [...teams].sort((a, b) => a.pos - b.pos)
    return sorted.slice(0, 2).map(t => ({ group, ...t }))
  })

  // 按组序排列对阵（12组×2=24队，小组赛晋级阶段取前16组对来凑8场淘汰赛）
  // 1/16决赛(Round of 32) —— 按世界杯标准对阵编排
  const r32Pairs: Array<[typeof top2[0], typeof top2[0]]> = [
    [top2[1], top2[3]],    // A2 vs B2 → 韩国 vs 瑞士
    [top2[0], top2[2]],    // A1 vs B1 → 墨西哥 vs 加拿大
    [top2[5], top2[7]],    // C2 vs D2 → 摩洛哥 vs 澳大利亚
    [top2[4], top2[6]],    // C1 vs D1 → 巴西 vs 美国
    [top2[9], top2[11]],   // E2 vs F2 → 科特迪瓦 vs 日本
    [top2[8], top2[10]],   // E1 vs F1 → 德国 vs 荷兰
    [top2[13], top2[15]],  // G2 vs H2 → 伊朗 vs 乌拉圭
    [top2[12], top2[14]],  // G1 vs H1 → 新西兰 vs 西班牙
  ]

  // 1/8决赛（16强）: 按相邻场次胜者交叉对阵
  const r16Pairs: Array<[typeof top2[0], typeof top2[0]]> = [
    [top2[3], top2[15]],   // B2 vs H2 → 瑞士 vs 乌拉圭
    [top2[0], top2[4]],    // A1 vs C1 → 墨西哥 vs 巴西
    [top2[2], top2[6]],    // B1 vs D1 → 加拿大 vs 美国
    [top2[5], top2[14]],   // C2 vs H1 → 摩洛哥 vs 西班牙
    [top2[10], top2[12]],  // F1 vs G1 → 荷兰 vs 新西兰
    [top2[8], top2[13]],   // E1 vs G2 → 德国 vs 伊朗
    [top2[11], top2[7]],   // F2 vs D2 → 日本 vs 澳大利亚
    [top2[9], top2[1]],    // E2 vs A2 → 科特迪瓦 vs 韩国
  ]

  // 1/4决赛：逐级汇聚
  const qfPairs: Array<[typeof top2[0], typeof top2[0]]> = [
    [top2[0], top2[2]],    // A1 vs B1 → 墨西哥 vs 加拿大
    [top2[4], top2[5]],    // C1 vs C2 → 巴西 vs 摩洛哥
    [top2[6], top2[8]],    // D1 vs E1 → 美国 vs 德国
    [top2[10], top2[12]],  // F1 vs G1 → 荷兰 vs 新西兰
  ]

  const sfPairs: Array<[typeof top2[0], typeof top2[0]]> = [
    [top2[0], top2[4]],    // A1 vs C1 → 墨西哥 vs 巴西
    [top2[8], top2[10]],   // E1 vs F1 → 德国 vs 荷兰
  ]

  const finalPair: Array<[typeof top2[0], typeof top2[0]]> = [
    [top2[4], top2[8]],    // C1 vs E1 → 巴西 vs 德国
  ]

  const mkSlot = (pair: [typeof top2[0], typeof top2[0]], round: string, isDecided: boolean): KnockoutSlot => ({
    round,
    home: pair[0].team,
    homeFlag: pair[0].flag,
    away: pair[1].team,
    awayFlag: pair[1].flag,
    isDecided,
  })

  const bracket: KnockoutSlot[][] = [
    r32Pairs.map(p => mkSlot(p, '小组赛晋级', true)),
    r16Pairs.map(p => mkSlot(p, '1/8 决赛', true)),
    qfPairs.map(p => mkSlot(p, '1/4 决赛', false)),
    sfPairs.map(p => mkSlot(p, '半决赛', false)),
    finalPair.map(p => ({ ...mkSlot(p, '决赛', false), aiPredict: '1:1' })),
  ]

  return NextResponse.json(bracket)
}
