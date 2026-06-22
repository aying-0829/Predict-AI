import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="flex flex-col items-center p-8 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-glass)] max-w-lg w-full">
        <div className="text-5xl font-bold text-[var(--neon-cyan)] mb-4">404</div>
        <h2 className="text-[var(--neon-cyan)] font-semibold text-lg mb-2">页面未找到</h2>
        <p className="text-[var(--text-dim)] text-sm mb-6 text-center">
          您访问的页面不存在或已被移除
        </p>
        <Link href="/" className="neon-btn">
          返回首页
        </Link>
      </div>
    </main>
  )
}
