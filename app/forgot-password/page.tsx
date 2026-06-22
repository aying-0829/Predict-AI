'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [step, setStep] = useState<'phone' | 'verify'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [devCode, setDevCode] = useState('')
  const countdownRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (countdownRef.current !== null) {
        clearInterval(countdownRef.current)
      }
    }
  }, [])

  const sendCodeRequest = async () => {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    const data = await res.json()
    if (!res.ok || data.code !== 0) throw new Error(data.message || '发送失败')
    if (data?.data?.devCode) {
      setDevCode(data.data.devCode)
    }
  }

  const startCountdown = () => {
    setCountdown(60)
    const timer = window.setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); countdownRef.current = null; return 0 }
        return prev - 1
      })
    }, 1000)
    countdownRef.current = timer
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await sendCodeRequest()
      setStep('verify')
      startCountdown()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '发生未知错误')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code, password: newPassword }),
      })
      const data = await res.json()
      if (!res.ok || data.code !== 0) throw new Error(data.message || '重置失败')
      setDone(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '发生未知错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" /* keep dynamic */>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-br from-[var(--neon-cyan)] to-[#a855f7] bg-clip-text text-transparent">PREDICT AI</h1>
          <p className="text-[#9098b0]">重置密码</p>
        </div>

        <div className="glass-panel p-8">
          {done ? (
            <div className="text-center space-y-4">
              <div className="text-5xl text-green-400">&#10003;</div>
              <h2 className="text-xl text-[#e8e8f0] font-semibold">密码重置成功</h2>
              <p className="text-[#9098b0]">请使用新密码登录。</p>
              <Link href="/login" className="inline-block text-[var(--neon-cyan)] hover:text-[#a855f7] transition-colors">
                返回登录
              </Link>
            </div>
          ) : step === 'phone' ? (
            <form onSubmit={handleSendCode} className="space-y-5">
              {error && (
                <div id="forgot-phone-error" role="alert" className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="forgot-phone" className="block text-sm text-[#9098b0] mb-1.5">手机号</label>
                <input
                  id="forgot-phone"
                  type="tel"
                  required
                  aria-required="true"
                  maxLength={11}
                  placeholder="请输入注册时使用的手机号"
                  className={`w-full bg-[#0c0c18] border rounded-lg px-4 py-2.5 text-[#e8e8f0] placeholder:text-[#505870] focus:outline-none focus:border-[var(--neon-cyan)]/50 transition-colors ${error ? 'border-red-500/50' : 'border-[rgba(0,229,255,0.15)]'}`}
                  aria-invalid={!!error}
                  aria-describedby={error ? 'forgot-phone-error' : undefined}
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full neon-btn disabled:opacity-50"
              >
                {loading ? '发送中...' : '获取验证码'}
              </button>

              <p className="text-center text-sm text-[#9098b0]">
                <Link href="/login" className="text-[var(--neon-cyan)] hover:text-[#a855f7] transition-colors">
                  返回登录
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              {error && (
                <div id="forgot-verify-error" role="alert" className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="forgot-code" className="block text-sm text-[#9098b0] mb-1.5">短信验证码</label>
                <div className="text-xs text-[#505870] mb-2">验证码已发送至 {phone}，请在手机上查收</div>

                {devCode && (
                  <div className="mb-3 px-3 py-2 rounded-md text-sm font-mono"
                    style={{
                      background: 'rgba(0,0,0,0.55)',
                      border: '1px solid rgba(0,229,255,0.25)',
                      color: '#00e5ff',
                      fontFamily: 'var(--font-jetbrains-mono), monospace',
                    }}
                  >
                    开发模式验证码：<span className="font-bold tracking-widest">{devCode}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    id="forgot-code"
                    type="text"
                    required
                    aria-required="true"
                    maxLength={6}
                    placeholder="6 位验证码"
                    className={`flex-1 bg-[#0c0c18] border rounded-lg px-4 py-2.5 text-[#e8e8f0] placeholder:text-[#505870] focus:outline-none focus:border-[var(--neon-cyan)]/50 transition-colors ${error ? 'border-red-500/50' : 'border-[rgba(0,229,255,0.15)]'}`}
                    aria-invalid={!!error}
                    aria-describedby={error ? 'forgot-verify-error' : undefined}
                    value={code}
                    onChange={e => setCode(e.target.value)}
                  />
                  <button
                    type="button"
                    aria-label="重新发送验证码"
                    disabled={countdown > 0 || loading}
                    onClick={async () => {
                      setError('')
                      try {
                        await sendCodeRequest()
                        startCountdown()
                      } catch (err: unknown) {
                        setError(err instanceof Error ? err.message : '重发失败')
                      }
                    }}
                    className="px-4 py-2.5 rounded-lg text-sm border border-[var(--neon-cyan)]/30 text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/10 transition-colors disabled:opacity-40 whitespace-nowrap"
                  >
                    {countdown > 0 ? `${countdown}s` : '重新发送'}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="forgot-new-password" className="block text-sm text-[#9098b0] mb-1.5">新密码</label>
                <input
                  id="forgot-new-password"
                  type="password"
                  required
                  aria-required="true"
                  minLength={6}
                  maxLength={20}
                  placeholder="6-20 位新密码"
                  className={`w-full bg-[#0c0c18] border rounded-lg px-4 py-2.5 text-[#e8e8f0] placeholder:text-[#505870] focus:outline-none focus:border-[var(--neon-cyan)]/50 transition-colors ${error ? 'border-red-500/50' : 'border-[rgba(0,229,255,0.15)]'}`}
                  aria-invalid={!!error}
                  aria-describedby={error ? 'forgot-verify-error' : undefined}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full neon-btn disabled:opacity-50"
              >
                {loading ? '提交中...' : '重置密码'}
              </button>

              <p className="text-center text-sm text-[#9098b0]">
                <button type="button" onClick={() => { setStep('phone'); setError('') }} className="text-[var(--neon-cyan)] hover:text-[#a855f7] transition-colors">
                  更换手机号
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
