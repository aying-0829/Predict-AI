import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '深度预测 - Prescient AI',
  description: '多模型融合深度分析，提供双色球、大乐透、福彩3D 的精准概率预测与走势分析。',
}

export default function DeepLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
