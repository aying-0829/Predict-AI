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
  const top2 = Object.entries(standings).flatMap(([group, teams]) => {
    const sorted = [...teams].sort((a, b) => a.pos - b.pos)
    return sorted.slice(0, 2).map(t => ({ group, ...t }))
  })
  const r32Pairs = [
    [top2[1], top2[3]], [top2[0], top2[2]], [top2[5], top2[7]], [top2[4], top2[6]],
    [top2[9], top2[11]], [top2[8], top2[10]], [top2[13], top2[15]], [top2[12], top2[14]],
  ]
  const r16Pairs = [
    [top2[3], top2[15]], [top2[0], top2[4]], [top2[2], top2[6]], [top2[5], top2[14]],
    [top2[10], top2[12]], [top2[8], top2[13]], [top2[11], top2[7]], [top2[9], top2[1]],
  ]
  const qfPairs = [
    [top2[0], top2[2]], [top2[4], top2[5]], [top2[6], top2[8]], [top2[10], top2[12]],
  ]
  const sfPairs = [
    [top2[0], top2[4]], [top2[8], top2[10]],
  ]
  const finalPair = [[top2[4], top2[8]]]
  const mkSlot = (pair, round, isDecided) => ({
    round, home: pair[0].team, homeFlag: pair[0].flag,
    away: pair[1].team, awayFlag: pair[1].flag, isDecided,
  })
  const bracket = [
    r32Pairs.map(p => mkSlot(p, '小组赛晋级', true)),
    r16Pairs.map(p => mkSlot(p, '1/8 决赛', true)),
    qfPairs.map(p => mkSlot(p, '1/4 决赛', false)),
    sfPairs.map(p => mkSlot(p, '半决赛', false)),
    finalPair.map(p => ({ ...mkSlot(p, '决赛', false), aiPredict: '1:1' })),
  ]
  return NextResponse.json(bracket)
}