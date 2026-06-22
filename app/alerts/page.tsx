'use client'

import { useState, useEffect } from 'react'

interface AlertItem {
  id: string
  lotteryName: string
  lotteryType: string
  drawTime: string
  enabled: boolean
  channels: {
    inapp: boolean
    wechat: boolean
    email: boolean
    sms: boolean
  }
}

interface ChannelConfigStatus {
  configured: boolean
  desc: string
}

interface ConfigStatusData {
  email: ChannelConfigStatus
  sms: ChannelConfigStatus
}

export default function AlertsPage() {
  const [subscriptions, setSubscriptions] = useState<AlertItem[]>([])
  const [loading, setLoading] = useState(true)
  const [configStatus, setConfigStatus] = useState<ConfigStatusData | null>(null)
  const [showConfigHelp, setShowConfigHelp] = useState<'email' | 'sms' | null>(null)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [testSending, setTestSending] = useState(false)

  useEffect(() => {
    fetchAlerts()
    fetchConfigStatus()
  }, [])

  async function fetchAlerts() {
    try {
      const res = await fetch('/api/alerts')
      const json = await res.json()
      if (json.code === 0) setSubscriptions(json.data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  async function fetchConfigStatus() {
    try {
      const res = await fetch('/api/alerts/config-status')
      const json = await res.json()
      if (json.code === 0) setConfigStatus(json.data)
    } catch {
      // ignore
    }
  }

  async function toggleEnabled(item: AlertItem) {
    const newEnabled = !item.enabled
    setSubscriptions(prev =>
      prev.map(s => (s.id === item.id ? { ...s, enabled: newEnabled } : s))
    )
    try {
      await fetch('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, enabled: newEnabled }),
      })
    } catch {
      setSubscriptions(prev =>
        prev.map(s => (s.id === item.id ? { ...s, enabled: item.enabled } : s))
      )
    }
  }

  async function toggleChannel(
    item: AlertItem,
    channel: 'inapp' | 'wechat' | 'email' | 'sms'
  ) {
    const newChannels = { ...item.channels, [channel]: !item.channels[channel] }
    setSubscriptions(prev =>
      prev.map(s => (s.id === item.id ? { ...s, channels: newChannels } : s))
    )
    try {
      await fetch('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, channels: newChannels }),
      })
    } catch {
      setSubscriptions(prev =>
        prev.map(s => (s.id === item.id ? { ...s, channels: item.channels } : s))
      )
    }
  }

  async function sendTest(channel: 'email' | 'sms') {
    setTestSending(true)
    setTestResult(null)

    const to =
      channel === 'email'
        ? prompt('请输入测试收件邮箱：')
        : prompt('请输入测试手机号（如 13800138000）：')

    if (!to) {
      setTestSending(false)
      return
    }

    try {
      const res = await fetch('/api/alerts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          to,
          subject: 'Prescient AI 通知测试',
          message: '这是一条来自 Prescient AI 的测试通知。',
        }),
      })
      const json = await res.json()
      setTestResult(
        json.code === 0
          ? `✓ ${json.message}`
          : `✗ ${json.message}`
      )
    } catch (err: unknown) {
      setTestResult(`✗ 请求失败: ${(err as Error).message || String(err)}`)
    } finally {
      setTestSending(false)
    }
  }

  const channelLabels: {
    key: 'inapp' | 'wechat' | 'email' | 'sms'
    label: string
    requiresConfig?: 'email' | 'sms'
  }[] = [
    { key: 'inapp', label: '站内通知' },
    { key: 'wechat', label: '微信推送' },
    { key: 'email', label: '邮件提醒', requiresConfig: 'email' },
    { key: 'sms', label: '短信提醒', requiresConfig: 'sms' },
  ]

  function renderConfigBadge(channel: 'email' | 'sms') {
    if (!configStatus) return null
    const status = configStatus[channel]
    return (
      <span
        className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${
          status.configured
            ? 'bg-green-900/40 text-green-400 border border-green-800'
            : 'bg-red-900/30 text-red-400 border border-red-800'
        }`}
      >
        {status.configured ? '已配置' : '未配置'}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-[#06060c]">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-[var(--neon-cyan)] font-serif">开奖提醒推送</h1>
          <p className="text-sm text-[#9098b0] mt-2">开启推送，不错过每一次开奖结果</p>
        </div>

        {/* 配置状态概览 */}
        {configStatus && (
          <div className="mb-8 p-4 rounded-xl bg-[#0c0c18] border border-[#0c0c18]">
            <h3 className="text-sm font-semibold text-[var(--neon-cyan)] mb-3">通知通道状态</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#9098b0]">邮件通道</span>
                  {renderConfigBadge('email')}
                </div>
                {configStatus.email.configured ? (
                  <button
                    onClick={() => sendTest('email')}
                    disabled={testSending}
                    className="text-[11px] px-2 py-1 rounded bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/30 transition-colors disabled:opacity-50"
                  >
                    {testSending ? '发送中...' : '发送测试'}
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      setShowConfigHelp(showConfigHelp === 'email' ? null : 'email')
                    }
                    className="text-[11px] px-2 py-1 rounded bg-[rgba(0,229,255,0.1)]/50 text-[#505870] hover:text-[#9098b0] transition-colors"
                  >
                    如何配置
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#9098b0]">短信通道</span>
                  {renderConfigBadge('sms')}
                </div>
                {configStatus.sms.configured ? (
                  <button
                    onClick={() => sendTest('sms')}
                    disabled={testSending}
                    className="text-[11px] px-2 py-1 rounded bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/30 transition-colors disabled:opacity-50"
                  >
                    {testSending ? '发送中...' : '发送测试'}
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      setShowConfigHelp(showConfigHelp === 'sms' ? null : 'sms')
                    }
                    className="text-[11px] px-2 py-1 rounded bg-[rgba(0,229,255,0.1)]/50 text-[#505870] hover:text-[#9098b0] transition-colors"
                  >
                    如何配置
                  </button>
                )}
              </div>
            </div>

            {/* 配置说明弹层 */}
            {showConfigHelp && (
              <div className="mt-4 p-3 rounded-lg bg-[#0d0b06] border border-[rgba(0,229,255,0.1)]">
                {showConfigHelp === 'email' && (
                  <div className="text-xs text-[#8a7040] space-y-1">
                    <p className="text-[#9098b0] font-semibold">邮件通道配置说明</p>
                    <p>在项目根目录创建 <code className="text-[var(--neon-cyan)]">.env.local</code> 文件，添加：</p>
                    <pre className="bg-[#050402] p-2 rounded mt-1 text-[10px] overflow-x-auto">
{`SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_USER=你的QQ邮箱@qq.com
SMTP_PASS=你的SMTP授权码`}
                    </pre>
                    <p>获取授权码：QQ邮箱 → 设置 → 账户 → POP3/SMTP 服务 → 生成授权码</p>
                    <p className="text-[#505870]">配置后重启开发服务器即可生效。</p>
                  </div>
                )}
                {showConfigHelp === 'sms' && (
                  <div className="text-xs text-[#8a7040] space-y-1">
                    <p className="text-[#9098b0] font-semibold">短信通道配置说明</p>
                    <p>需先在<a href="https://console.cloud.tencent.com/smsv2" target="_blank" className="text-[var(--neon-cyan)] underline">腾讯云短信控制台</a>开通服务，然后在 <code className="text-[var(--neon-cyan)]">.env.local</code> 添加：</p>
                    <pre className="bg-[#050402] p-2 rounded mt-1 text-[10px] overflow-x-auto">
{`SMS_SECRET_ID=你的SecretId
SMS_SECRET_KEY=你的SecretKey
SMS_APP_ID=你的应用ID
SMS_SIGN_NAME=短信签名
SMS_TEMPLATE_ID=模板ID`}
                    </pre>
                    <p className="text-[#505870]">配置后重启开发服务器即可生效。</p>
                  </div>
                )}
              </div>
            )}

            {/* 测试结果 */}
            {testResult && (
              <p
                className={`mt-3 text-xs ${
                  testResult.startsWith('✓') ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {testResult}
              </p>
            )}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-[var(--neon-cyan)] border-t-transparent rounded-full" />
          </div>
        )}

        {!loading && subscriptions.length === 0 && (
          <div className="text-center py-16 text-[#505870]">
            <p className="text-sm">暂无提醒订阅</p>
            <p className="text-xs mt-1">添加彩票后可在此管理开奖提醒</p>
          </div>
        )}

        {!loading && (
          <div className="space-y-4">
            {subscriptions.map(item => (
              <div
                key={item.id}
                className={`rounded-xl border transition-all ${
                  item.enabled
                    ? 'bg-[#0c0c18] border-[rgba(0,229,255,0.1)]'
                    : 'bg-[#14120a] border-[#1f1a10] opacity-70'
                } p-5`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[15px] font-bold text-[var(--neon-cyan)]">
                      {item.lotteryName}
                    </div>
                    <div className="text-xs text-[#505870] mt-1">{item.drawTime}</div>
                  </div>
                  <button
                    onClick={() => toggleEnabled(item)}
                    className={`relative w-12 h-7 rounded-full transition-colors flex items-center ${
                      item.enabled ? 'bg-[var(--neon-cyan)]' : 'bg-[rgba(0,229,255,0.1)]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-[#0c0c18] shadow transition-transform ${
                        item.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {item.enabled && (
                  <div className="flex flex-wrap gap-4 sm:gap-6 mt-4 pt-4 border-t border-[#0c0c18]">
                    {channelLabels.map(ch => {
                      const isConfiguredRequired =
                        ch.requiresConfig && configStatus
                          ? configStatus[ch.requiresConfig].configured
                          : true

                      return (
                        <label
                          key={ch.key}
                          className={`flex items-center gap-2 ${
                            isConfiguredRequired
                              ? 'cursor-pointer'
                              : 'cursor-not-allowed opacity-50'
                          }`}
                          title={
                            !isConfiguredRequired && ch.requiresConfig
                              ? configStatus?.[ch.requiresConfig].desc
                              : undefined
                          }
                        >
                          <input
                            type="checkbox"
                            checked={item.channels[ch.key]}
                            onChange={() => toggleChannel(item, ch.key)}
                            disabled={!isConfiguredRequired}
                            className="w-4 h-4 rounded border-[rgba(0,229,255,0.1)] bg-[#0c0c18] accent-[var(--neon-cyan)]"
                          />
                          <span
                            className={`text-xs transition-colors ${
                              item.channels[ch.key]
                                ? 'text-[var(--neon-cyan)]'
                                : 'text-[#505870]'
                            }`}
                          >
                            {ch.label}
                          </span>
                          {ch.requiresConfig && renderConfigBadge(ch.requiresConfig)}
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <p className="text-xs text-[#4a4020] text-center mt-8">
            提醒通知将在开奖后 5 分钟内发送，请确保网络连接正常
          </p>
        )}
      </main>
    </div>
  )
}
