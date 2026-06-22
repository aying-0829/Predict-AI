'use client'

type MemberFeature = { key: string; label: string; free: string | boolean; member: string | boolean }

interface FeatureComparisonTableProps {
  features: MemberFeature[]
}

export function FeatureComparisonTable({ features }: FeatureComparisonTableProps) {
  return (
    <div className="bg-[#0c0c18] rounded-xl border border-[rgba(0,229,255,0.1)] overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-[#0c0c18]">
            <th className="text-left px-6 py-3 text-sm font-medium text-[#e8e8f0]">功能</th>
            <th className="text-center px-6 py-3 text-sm font-medium text-[#9098b0]">免费版</th>
            <th className="text-center px-6 py-3 text-sm font-medium text-[var(--neon-cyan)]">
              <span className="flex items-center justify-center gap-1.5">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M2 6l3 8h14l3-8-5 4-5-9-5 9-5-4z" /></svg>
                会员
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((f, i) => (
            <tr key={f.key} className={i % 2 === 0 ? 'bg-[#0c0c18]' : 'bg-[#06060c]'}>
              <td className="px-6 py-3 text-sm text-[var(--neon-cyan)]">{f.label}</td>
              <td className="px-6 py-3 text-center text-sm">
                {f.free === false ? (
                  <svg className="w-4 h-4 text-red-400/60 shrink-0 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <span className="text-[#9098b0]">{f.free}</span>
                )}
              </td>
              <td className="px-6 py-3 text-center text-sm">
                {f.member === true ? (
                  <svg className="w-4 h-4 text-[var(--neon-cyan)] shrink-0 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-[var(--neon-cyan)] font-medium">{f.member}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
