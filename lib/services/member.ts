export type MemberPlan = {
  id: string
  name: string
  price: number
  period: string
  originalPrice: number
  monthlyPrice: number
  badge?: string
}

export function getMemberPlans(): MemberPlan[] {
  return [
    { id: 'monthly', name: '月卡', price: 29.9, period: '月', originalPrice: 29.9, monthlyPrice: 29.9 },
    { id: 'quarterly', name: '季卡', price: 59.9, period: '季', originalPrice: 89.7, monthlyPrice: 19.97, badge: '推荐' },
    { id: 'yearly', name: '年卡', price: 149.9, period: '年', originalPrice: 358.8, monthlyPrice: 12.49, badge: '最划算' },
  ]
}

export type MemberFeature = {
  key: string
  label: string
  free: string | boolean
  member: string | boolean
}

export function getMemberFeatures(): MemberFeature[] {
  return [
    { key: 'ai_predictions', label: 'AI 预测次数', free: '每日 3 次', member: '无限次' },
    { key: 'probability_analysis', label: '概率分析深度', free: '基础', member: '高级' },
    { key: 'worldcup_ai', label: '世界杯 AI 推演', free: false, member: true },
    { key: 'trend_chart', label: '历史趋势图表', free: false, member: true },
    { key: 'multi_period', label: 'AI 多期选号', free: false, member: '3 期推荐' },
    { key: 'hot_cold', label: '冷热号分析', free: false, member: true },
    { key: 'data_export', label: '数据导出', free: false, member: true },
    { key: 'badge', label: '社区专属标识', free: false, member: '会员徽章' },
  ]
}

export type UserProfile = {
  name: string
  plan: string
  planName: string
  expireDate: string
  totalPredictions: number
  checkinDays: number
  points: number
}

export function getUserProfile(): UserProfile {
  return {
    name: 'Marvis',
    plan: 'yearly',
    planName: '年卡会员',
    expireDate: '2027-06-14',
    totalPredictions: 342,
    checkinDays: 87,
    points: 2840,
  }
}

export type PointsRecord = {
  id: number
  type: 'checkin' | 'prediction' | 'share' | 'streak' | 'redeem'
  description: string
  date: string
  amount: number
}

export function getPointsHistory(): PointsRecord[] {
  return [
    { id: 1, type: 'checkin', description: '每日签到', date: '2026-06-14', amount: 10 },
    { id: 2, type: 'streak', description: '连续签到 7 天奖励', date: '2026-06-14', amount: 100 },
    { id: 3, type: 'prediction', description: '完成 AI 预测', date: '2026-06-13', amount: 5 },
    { id: 4, type: 'share', description: '分享预测结果', date: '2026-06-13', amount: 20 },
    { id: 5, type: 'checkin', description: '每日签到', date: '2026-06-12', amount: 10 },
  ]
}

export type PointsRule = {
  action: string
  points: number
  description: string
}

export function getPointsRules(): PointsRule[] {
  return [
    { action: '每日签到', points: 10, description: '每日登录签到即得 +10 积分' },
    { action: '完成预测', points: 5, description: '每次完成 AI 预测 +5 积分' },
    { action: '分享', points: 20, description: '分享预测结果到社区 +20 积分' },
    { action: '连续 7 天', points: 100, description: '连续签到 7 天额外 +100 积分' },
  ]
}

export function checkin() {
  const streak = 88
  return {
    success: true,
    points: 10,
    streak,
  }
}

export function subscribe(planId: string) {
  const plans = getMemberPlans()
  const plan = plans.find(p => p.id === planId)
  if (!plan) {
    throw new Error(`Invalid plan: ${planId}`)
  }
  const now = new Date()
  const expireDate = new Date(now)
  if (planId === 'monthly') expireDate.setMonth(expireDate.getMonth() + 1)
  else if (planId === 'quarterly') expireDate.setMonth(expireDate.getMonth() + 3)
  else if (planId === 'yearly') expireDate.setFullYear(expireDate.getFullYear() + 1)

  return {
    success: true,
    plan: plan.name,
    expireDate: expireDate.toISOString().slice(0, 10),
  }
}
