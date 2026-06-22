import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '会员中心 - Prescient AI',
  description: 'Prescient AI 会员中心，查看积分、签到记录、预测历史与个性化推荐。',
}

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
