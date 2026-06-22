'use client'

import { useTranslation } from '@/lib/i18n'

interface QuickQuestionsProps {
  onSelect: (question: string) => void
  disabled: boolean
}

export default function QuickQuestions({ onSelect, disabled }: QuickQuestionsProps) {
  const { t } = useTranslation()

  const questions = [
    { id: 'q1', text: t.aiChat.q1 },
    { id: 'q2', text: t.aiChat.q2 },
    { id: 'q3', text: t.aiChat.q3 },
    { id: 'q4', text: t.aiChat.q4 },
  ]

  return (
    <div className="px-4 py-3 border-b border-[rgba(0,229,255,0.08)] bg-[rgba(6,6,12,0.9)]">
      <p className="text-xs text-[#505870] uppercase tracking-wider mb-2">{t.aiChat.quickQuestions}</p>
      <div className="flex flex-wrap gap-2">
        {questions.map(q => (
          <button
            key={q.id}
            onClick={() => onSelect(q.text)}
            disabled={disabled}
            className="text-xs px-3 py-1.5 rounded-full transition-colors disabled:opacity-40 bg-[rgba(12,12,24,0.9)] border border-[rgba(0,229,255,0.1)] text-[#9098b0]"
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--neon-cyan)';
              e.currentTarget.style.borderColor = 'rgba(0,229,255,0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#9098b0';
              e.currentTarget.style.borderColor = 'rgba(0,229,255,0.1)';
            }}
          >
            {q.text}
          </button>
        ))}
      </div>
    </div>
  )
}
