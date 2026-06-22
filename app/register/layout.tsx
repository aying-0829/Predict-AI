import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '注册 - Prescient AI',
  description: '注册 Prescient AI 账号，享受 AI 驱动的双色球、大乐透、福彩3D 预测与竞彩足球分析服务。',
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
