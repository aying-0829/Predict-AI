'use client'

type MemberPlan = {
  id: string; name: string; price: number; period: string
  originalPrice: number; monthlyPrice: number; badge?: string
}
type MemberFeature = { key: string; label: string; free: string | boolean; member: string | boolean }

export { type MemberPlan, type MemberFeature }

function CheckIconEl() {
  return (
    <svg className="w-4 h-4 text-[var(--neon-cyan)] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

interface PlanCardProps {
  plan: MemberPlan
  profilePlan?: string
  features: MemberFeature[]
  onSubscribe: (planId: string) => void
  subscribing: string | null
}

export function PlanCard({ plan, profilePlan, features, onSubscribe, subscribing }: PlanCardProps) {
  const isPopular = plan.badge === '推荐'
  const isBest = plan.badge === '最划算'
  const isCurrent = profilePlan === plan.id

  let cardClasses = 'bg-[#0c0c18] rounded-xl p-6 flex flex-col relative flex-shrink-0 w-72 transition-all duration-300'
  let badgeClasses = ''

  if (isBest) {
    cardClasses += ' border-2 border-[rgba(0,229,255,0.3)] gold-glow-hover'
    badgeClasses = 'bg-[var(--neon-cyan)] text-[#080808]'
  } else if (isPopular) {
    cardClasses += ' border-2 border-[rgba(0,229,255,0.3)]/40 gold-glow-hover'
    badgeClasses = 'bg-[var(--neon-cyan)]/15 text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/30'
  } else {
    cardClasses += ' border border-[rgba(0,229,255,0.1)]'
  }

  return (
    <div className={cardClasses}>
      {plan.badge && (
        <div className={`absolute -top-2.5 right-4 px-3 py-0.5 rounded-full text-xs font-bold ${badgeClasses}`}>
          {plan.badge}
        </div>
      )}
      <h3 className="text-lg font-serif text-[var(--neon-cyan)] mb-1">{plan.name}</h3>
      <p className="text-xs text-[#9098b0] mb-5">
        {plan.id === 'monthly' ? '灵活月付' : plan.id === 'quarterly' ? '性价比之选' : '享最低日均价'}
      </p>
      <div className="mb-1">
        <span className={`font-numeric text-3xl font-bold ${isBest ? 'text-white' : 'text-[var(--neon-cyan)]'}`}>¥{plan.price}</span>
        <span className="text-sm text-[#9098b0] ml-1">/{plan.period}</span>
      </div>
      {plan.originalPrice > plan.price && (
        <p className="text-xs line-through text-[#505870] mb-2">原价 ¥{plan.originalPrice}</p>
      )}
      <p className="text-xs text-[#9098b0] mb-5">月均 ¥{plan.monthlyPrice}</p>
      <ul className="flex-1 space-y-2.5 mb-6">
        {features.map(f => (
          <li key={f.key} className="text-xs flex items-start gap-2 text-[#e8e8f0]">
            <CheckIconEl /> {f.label}
            {typeof f.member === 'string' && (
              <span className="ml-auto text-[10px] text-[var(--neon-cyan)]">{f.member}</span>
            )}
          </li>
        ))}
      </ul>
      <button
        onClick={() => onSubscribe(plan.id)}
        disabled={subscribing === plan.id || isCurrent}
        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${
          isCurrent
            ? 'bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)] cursor-default'
            : isBest
              ? 'bg-[var(--neon-cyan)] text-[#080808] hover:bg-[var(--neon-cyan)]'
              : 'bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)] border border-[var(--neon-cyan)]/30 hover:bg-[var(--neon-cyan)]/20'
        }`}
      >
        {subscribing === plan.id ? '处理中...' : isCurrent ? '当前方案' : '立即订阅'}
      </button>
    </div>
  )
}
