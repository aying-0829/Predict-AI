import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '社区 - Prescient AI',
  description: 'Prescient AI 用户社区，分享预测心得、讨论赛事分析、查看高手推荐。',
}

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
