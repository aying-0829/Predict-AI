'use client'

interface User { rank:number; userId:number; username:string; points:number; accuracy:number; currentStreak:number; totalPredictions:number; totalHits:number }

export default function RankingTable({ data, type }: { data:User[]; type:'accuracy'|'streak'|'points' }) {
  const getTypeLabel = () => { switch(type){ case'accuracy':return'准确率'; case'streak':return'最长连胜'; case'points':return'积分' } }
  const getValue = (u:User) => { switch(type){ case'accuracy':return `${u.accuracy}%`; case'streak':return `${u.currentStreak} 连`; case'points':return `${u.points} 分` } }
  const rankColors = ['text-yellow-400','text-slate-300','text-amber-600']

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[var(--text-label)]" /* keep dynamic */>
            <th className="py-3 pl-4 w-16 font-medium">排名</th>
            <th className="py-3 font-medium">用户</th>
            <th className="py-3 text-right font-medium">{getTypeLabel()}</th>
            <th className="py-3 text-right pr-4 font-medium">预测数</th>
          </tr>
        </thead>
        <tbody>
          {data.map(u => (
            <tr key={u.userId} className="data-row border-b border-[rgba(0,229,255,0.04)]">
              <td className="py-3 pl-4"><span className={`font-bold text-lg ${rankColors[u.rank-1]||'text-[var(--text-dim)]'}`}>{u.rank<=3?['🥇','🥈','🥉'][u.rank-1]:`#${u.rank}`}</span></td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full border border-[var(--neon-cyan)]/10 flex items-center justify-center text-sm text-[var(--text-heading)] bg-[rgba(10,13,28,0.5)]">{u.username.charAt(0)}</div>
                  <span className="text-[var(--text-heading)] font-medium">{u.username}</span>
                </div>
              </td>
              <td className="py-3 text-right text-[var(--neon-cyan)] font-semibold">{getValue(u)}</td>
              <td className="py-3 text-right pr-4 text-[var(--text-label)]">{u.totalPredictions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
