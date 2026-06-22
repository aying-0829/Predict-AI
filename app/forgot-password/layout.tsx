import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '忘记密码 - Prescient AI',
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
