'use client'

import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { useTranslation } from '@/lib/i18n'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled: boolean
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { t } = useTranslation()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setInput('')
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px'
    }
  }

  return (
    <div className="p-4" /* keep dynamic */>
      <div className="flex gap-3 items-end max-w-3xl mx-auto">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => { setInput(e.target.value); handleInput() }}
          onKeyDown={handleKeyDown}
          placeholder={t.aiChat.placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
          style={{
            background: 'rgba(12,12,24,0.9)',
            border: '1px solid rgba(0,229,255,0.12)',
            color: '#e8e8f0',
          }}
          onFocus={e => { e.target.style.borderColor = 'rgba(0,229,255,0.4)'; e.target.style.boxShadow = '0 0 20px rgba(0,229,255,0.08)'; }}
          onBlur={e => { e.target.style.borderColor = 'rgba(0,229,255,0.12)'; e.target.style.boxShadow = 'none'; }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, rgba(0,229,255,0.2), rgba(168,85,247,0.2))',
            border: '1px solid rgba(0,229,255,0.3)',
            color: 'var(--neon-cyan)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(0,229,255,0.6)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0,229,255,0.2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(0,229,255,0.3)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  )
}
