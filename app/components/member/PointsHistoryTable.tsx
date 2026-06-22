'use client'

type PointsRecord = { id: number; type: string; description: string; date: string; amount: number }

export { type PointsRecord }

interface PointsHistoryTableProps {
  history: PointsRecord[]
}

const typeLabel: Record<string, string> = {
  checkin: '签到',
  prediction: '预测',
  share: '分享',
  streak: '连续奖励',
  redeem: '兑换',
}

export function PointsHistoryTable({ history }: PointsHistoryTableProps) {
  return (
    <div className="bg-[#0c0c18] rounded-xl border border-[rgba(0,229,255,0.1)] overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-[#0c0c18]">
            <th className="text-left px-6 py-3 text-sm font-medium text-[#e8e8f0]">日期</th>
            <th className="text-left px-6 py-3 text-sm font-medium text-[#e8e8f0]">说明</th>
            <th className="text-left px-6 py-3 text-sm font-medium text-[#e8e8f0]">类型</th>
            <th className="text-right px-6 py-3 text-sm font-medium text-[#e8e8f0]">积分</th>
          </tr>
        </thead>
        <tbody>
          {history.map((record, i) => (
            <tr key={record.id} className={i % 2 === 0 ? 'bg-[#0c0c18]' : 'bg-[#06060c]'}>
              <td className="px-6 py-3 text-sm text-[var(--neon-cyan)]">{record.date}</td>
              <td className="px-6 py-3 text-sm text-[#e8e8f0]">{record.description}</td>
              <td className="px-6 py-3 text-sm">
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)]">
                  {typeLabel[record.type] || record.type}
                </span>
              </td>
              <td className={`px-6 py-3 text-sm text-right font-numeric font-medium ${
                record.amount > 0 ? 'text-[var(--neon-cyan)]' : 'text-red-400'
              }`}>
                {record.amount > 0 ? '+' : ''}{record.amount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {history.length === 0 && (
        <div className="px-6 py-10 text-center text-sm text-[#505870]">暂无积分记录</div>
      )}
    </div>
  )
}
