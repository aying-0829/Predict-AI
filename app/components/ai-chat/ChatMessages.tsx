'use client'

import { useEffect, useRef } from 'react'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface ChatMessagesProps {
  messages: Message[]
  loading: boolean
}

export default function ChatMessages({ messages, loading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#505870]">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4" style={{ color: 'rgba(0,229,255,0.1)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <p className="text-sm">向 AI 助手提问，获取智能预测分析</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map(msg => (
        <div
          key={msg.id}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed text-[#e8e8f0] ${
              msg.role === 'user'
                ? 'rounded-br-md bg-[rgba(0,229,255,0.12)] border border-[rgba(0,229,255,0.2)]'
                : 'rounded-bl-md bg-[rgba(12,12,24,0.8)] border border-[rgba(0,229,255,0.08)] border-l-2 border-l-[rgba(0,229,255,0.4)]'
            }`}
          >
            <div
              className="prose prose-sm prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: msg.content
                  .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--neon-cyan)">$1</strong>')
                  .replace(/\n/g, '<br/>'),
              }}
            />
            <div className="text-[10px] text-[#505870] mt-1.5">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      ))}

      {loading && (
        <div className="flex justify-start">
          <div
            className="rounded-2xl rounded-bl-md px-4 py-3"
            /* keep dynamic */
          >
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--neon-cyan)', animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--neon-cyan)', animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--neon-cyan)', animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
