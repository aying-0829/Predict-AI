import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '重置密码 - Prescient AI',
}

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
