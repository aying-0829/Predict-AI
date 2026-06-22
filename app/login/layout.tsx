import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '登录 - Prescient AI',
  description: '登录 Prescient AI，同步您的预测数据、积分和个性化设置。',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
