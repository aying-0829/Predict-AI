import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '竞彩足球 - Prescient AI',
  description: 'AI 驱动的竞彩足球赛事预测分析，覆盖五大联赛、欧冠、世界杯等热门赛事。',
}

export default function BettingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
