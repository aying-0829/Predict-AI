'use client'

import { useEffect } from 'react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[RouteError]', error)
  }, [error])

  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="flex flex-col items-center p-8 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-glass)] max-w-lg w-full">
        <div className="text-4xl mb-4 text-[var(--neon-cyan)]">!</div>
        <h2 className="text-[var(--neon-cyan)] font-semibold text-lg mb-2">页面加载异常</h2>
        <p className="text-[var(--text-dim)] text-sm mb-6 text-center max-w-md">
          {error.message || '发生了意外错误，请稍后重试'}
        </p>
        <button onClick={reset} className="neon-btn">
          重新加载
        </button>
      </div>
    </main>
  )
}
