'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams?.get('token') || ''

  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }
    if (form.password.length < 6) {
      setError('密码长度至少6位')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '重置失败')
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '发生未知错误')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" /* keep dynamic */>
        <div className="glass-panel p-8 text-center max-w-md w-full">
          <div className="text-5xl mb-4 text-red-400">!</div>
          <h2 className="text-xl text-[#e8e8f0] font-semibold mb-2">无效的重置链接</h2>
          <p className="text-[#9098b0] mb-6">重置令牌缺失或已过期，请重新申请。</p>
          <Link href="/forgot-password" className="text-[var(--neon-cyan)] hover:text-[#a855f7] transition-colors">
            重新申请
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" /* keep dynamic */>
        <div className="glass-panel p-8 text-center max-w-md w-full">
          <div className="text-5xl mb-4 text-[var(--neon-cyan)]">&#10003;</div>
          <h2 className="text-xl text-[#e8e8f0] font-semibold mb-2">密码已重置</h2>
          <p className="text-[#9098b0] mb-6">请使用新密码登录。</p>
          <Link href="/login" className="text-[var(--neon-cyan)] hover:text-[#a855f7] transition-colors">
            前往登录
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" /* keep dynamic */>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-br from-[var(--neon-cyan)] to-[#a855f7] bg-clip-text text-transparent">PREDICT AI</h1>
          <p className="text-[#9098b0]">设置新密码</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-8 space-y-5">
          {error && (
            <div id="reset-error" role="alert" className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="reset-password" className="block text-sm text-[#9098b0] mb-1.5">新密码</label>
            <input
              id="reset-password"
              type="password"
              required
              aria-required="true"
              placeholder="最少6位字符"
              className={`w-full bg-[#0c0c18] border rounded-lg px-4 py-2.5 text-[#e8e8f0] placeholder:text-[#505870] focus:outline-none focus:border-[var(--neon-cyan)]/50 transition-colors ${error ? 'border-red-500/50' : 'border-[rgba(0,229,255,0.15)]'}`}
              aria-invalid={!!error}
              aria-describedby={error ? 'reset-error' : undefined}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="reset-confirm" className="block text-sm text-[#9098b0] mb-1.5">确认新密码</label>
            <input
              id="reset-confirm"
              type="password"
              required
              aria-required="true"
              placeholder="再次输入密码"
              className={`w-full bg-[#0c0c18] border rounded-lg px-4 py-2.5 text-[#e8e8f0] placeholder:text-[#505870] focus:outline-none focus:border-[var(--neon-cyan)]/50 transition-colors ${error ? 'border-red-500/50' : 'border-[rgba(0,229,255,0.15)]'}`}
              aria-invalid={!!error}
              aria-describedby={error ? 'reset-error' : undefined}
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full neon-btn disabled:opacity-50"
          >
            {loading ? '重置中...' : '重置密码'}
          </button>

          <p className="text-center text-sm text-[#9098b0]">
            <Link href="/login" className="text-[var(--neon-cyan)] hover:text-[#a855f7] transition-colors">
              返回登录
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" /* keep dynamic */>
      <div className="glass-panel p-8 text-center max-w-md w-full">
        <div className="w-8 h-8 border-2 border-[var(--neon-cyan)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#9098b0]">加载中...</p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
