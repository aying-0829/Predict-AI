/**
 * Engine barrel export — unified entry for all engine modules.
 */

export { analyzeHotCold, generateRecommendations } from './lottery'
export type {
  LotteryDraw,
  FrequencyItem,
  LotteryAnalysis,
  LotteryRecommendation,
} from './lottery'

export { predictMatch } from './sports'
export type { SportMatchInput, SportPrediction } from './sports'

export { verifyLotteryDraw, verifySportsMatches, recalculateAccuracy } from './validation'
