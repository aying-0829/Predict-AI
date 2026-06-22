import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '分享预测 - Prescient AI',
  description: '一键生成预测卡片，分享 AI 预测结果到社交媒体，展示预测战绩。',
}

export default function ShareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
