import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '实时数据 - Prescient AI',
  description: '实时赛事数据与 AI 预测对比，追踪最新比赛进程与预测准确率。',
}

export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
