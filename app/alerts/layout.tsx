import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '提醒设置 - Prescient AI',
  description: '设置 AI 预测提醒，支持短信和邮件通知，第一时间获取开奖结果和赛事预测。',
}

export default function AlertsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
