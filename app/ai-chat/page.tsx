'use client'

import { useState, useCallback } from 'react'
import ChatMessages, { type Message } from '@/app/components/ai-chat/ChatMessages'
import ChatInput from '@/app/components/ai-chat/ChatInput'
import QuickQuestions from '@/app/components/ai-chat/QuickQuestions'
import { useTranslation } from '@/lib/i18n'

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      })
      const json = await res.json()

      if (json.code === 0 && json.data) {
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: json.data.content,
          timestamp: json.data.timestamp || Date.now(),
        }
        setMessages(prev => [...prev, aiMsg])
      } else {
        const errMsg: Message = {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          content: '抱歉，AI 服务暂时不可用，请稍后重试。',
          timestamp: Date.now(),
        }
        setMessages(prev => [...prev, errMsg])
      }
    } catch {
      const errMsg: Message = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        content: '网络连接失败，请检查网络后重试。',
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col" /* keep dynamic */>
      <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[rgba(0,229,255,0.08)]">
          <div className="flex items-center gap-2">
            <span>💬</span>
            <h1 className="text-xl font-bold"
              style={{
                background: 'linear-gradient(135deg, var(--neon-cyan), #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >{t.aiChat.title}</h1>
          </div>
          <p className="text-xs text-[#505870] mt-0.5">{t.aiChat.subtitle}</p>
        </div>

        {/* Quick Questions */}
        <QuickQuestions onSelect={sendMessage} disabled={loading} />

        {/* Messages */}
        <ChatMessages messages={messages} loading={loading} />

        {/* Input */}
        <ChatInput onSend={sendMessage} disabled={loading} />
      </div>
    </div>
  )
}
