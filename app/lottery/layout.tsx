import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '智能选号 - Prescient AI',
  description: 'AI 驱动的双色球、大乐透、福彩3D 智能选号推荐，基于深度学习模型分析历史数据。',
}

export default function LotteryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
