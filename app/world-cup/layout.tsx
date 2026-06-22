import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '世界杯预测 - Prescient AI',
  description: '2026 世界杯赛事 AI 预测分析，实时比分、赛程、球队数据与智能预测。',
}

export default function WorldCupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
