'use client'

import { ChatCircleText, ChatTeardrop, Warning } from 'phosphor-react'
import { CHAT_MESSAGES } from './data'

function ChatMessage({ user, content }: { user: string; content: string }) {
  const isEmoji = content.startsWith('[') || content === '!!!!!!!!'
  const isLong = content.length > 15

  return (
    <div className="flex gap-3 py-2.5 px-3 rounded-lg hover:bg-[rgba(255,255,255,0.02)] transition-colors">
      {/* Avatar placeholder */}
      <div
        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
        style={{
          background: 'linear-gradient(135deg, rgba(0,240,255,0.2), rgba(255,0,170,0.15))',
          border: '1px solid var(--border-laser)',
          color: 'var(--neon-cyan)',
        }}
      >
        {user.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-medium text-[var(--neon-cyan)]/80">{user}</span>
        </div>
        <p
          className={`mt-0.5 leading-relaxed ${
            isEmoji
              ? 'text-base text-[var(--neon-amber)]'
              : isLong
              ? 'text-sm text-[var(--text-body)]'
              : 'text-sm text-[var(--text-body)]'
          }`}
        >
          {content}
        </p>
      </div>
    </div>
  )
}

export default function ChatTab() {
  return (
    <div className="flex flex-col">
      {/* Messages area */}
      <div className="laser-panel divide-y divide-[var(--border-laser)]/20 mb-4">
        <div className="px-4 py-3 border-b border-[var(--border-laser)] flex items-center gap-2">
          <ChatCircleText size={18} className="text-[var(--neon-cyan)]" />
          <span className="text-sm font-semibold text-[var(--text-heading)]">文字直播间</span>
          <span className="text-[10px] text-[var(--text-dim)] ml-auto">
            {CHAT_MESSAGES.length} 条评论
          </span>
        </div>
        <div className="max-h-[600px] overflow-y-auto">
          {CHAT_MESSAGES.map((msg, i) => (
            <ChatMessage key={i} user={msg.user} content={msg.content} />
          ))}
        </div>
      </div>

      {/* Bottom notice */}
      <div className="laser-panel p-4 text-center border-[var(--neon-amber)]/20">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Warning size={14} className="text-[var(--neon-amber)]" />
          <span className="text-xs text-[var(--text-label)]">
            电脑端不支持聊天，可打开手机百度参与聊天
          </span>
        </div>
        <div className="relative">
          <input
            type="text"
            disabled
            placeholder="输入聊天内容..."
            className="input-terminal !pr-12 opacity-50 cursor-not-allowed"
          />
          <button
            disabled
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-dim)] opacity-30"
          >
            <ChatTeardrop size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
