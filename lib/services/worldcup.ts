import {
  worldCupMatches,
  groupStandings,
  groupNames,
  knockoutBracket,
  topScorers,
  tournamentStats,
  accuracyStats,
  matchDates,
  danmakuPool,
  type GroupStanding,
  type KnockoutSlot,
  type Match,
  type MatchStats,
  type Scorer,
} from '../data'

export type { GroupStanding, KnockoutSlot, MatchStats }

export function getWorldCupMatches(): Match[] {
  return worldCupMatches
}

export function getGroupStandings(): Record<string, GroupStanding[]> {
  return groupStandings
}

export function getGroupNames(): string[] {
  return groupNames
}

export function getKnockoutBracket(): KnockoutSlot[][] {
  return knockoutBracket
}

export function getTopScorers(): Scorer[] {
  return topScorers
}

export function getTournamentStats() {
  return tournamentStats
}

export function getAccuracyStats() {
  return accuracyStats
}

export function getMatchById(id: string): Match | undefined {
  return worldCupMatches.find(m => m.id === id)
}

export function getMatchDates() {
  return matchDates
}

export function getDanmakuPool(): string[] {
  return danmakuPool
}
