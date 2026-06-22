// Barrel export for lib/services — re-exports all service modules
// This file maintains backward compatibility with existing imports from '@/lib/services'

// World Cup
export {
  getWorldCupMatches,
  getGroupStandings,
  getGroupNames,
  getKnockoutBracket,
  getTopScorers,
  getTournamentStats,
  getAccuracyStats,
  getMatchById,
  getMatchDates,
  getDanmakuPool,
  type GroupStanding,
  type KnockoutSlot,
  type MatchStats,
} from './worldcup'

// Lottery
export {
  getLotteryHistory,
  getHotColdAnalysis,
  getAIPredictions,
  getMissStats,
  getLotteryTypes,
  getLotteryData,
  type LotteryType,
  type LotteryHistoryItem,
  type HotColdItem,
  type AIRecommendation,
  type MissStat,
  type LotteryTypeInfo,
  type LotteryDrawData,
} from './lottery'

// Sports / Betting
export {
  getSportMatches,
  getHandicapData,
  getAIAnalysis,
  submitBetSlip,
  type SportMatch,
  type HandicapItem,
  type AIAnalysisResult,
  type BetSelection,
} from './sports'

// Member
export {
  getMemberPlans,
  getMemberFeatures,
  getUserProfile,
  getPointsHistory,
  getPointsRules,
  checkin,
  subscribe,
  type MemberPlan,
  type MemberFeature,
  type UserProfile,
  type PointsRecord,
  type PointsRule,
} from './member'

// Dashboard
export {
  getKpiStats,
  getAccuracyBreakdown,
  getPredictionHistory,
  getRecentTrend,
  getTodayRecommendations,
  getLiveMatch,
  type KpiStats,
  type AccuracyBreakdown,
  type PredictionRecord,
  type TrendPoint,
  type TodayRecommendation,
  type LiveMatchInfo,
} from './dashboard'

// Poster
export {
  getPosterData,
  type PosterData,
} from './poster'

// Alert
export {
  getAlertSubscriptions,
  updateAlertSubscription,
  type AlertSubscription,
} from './alert'
