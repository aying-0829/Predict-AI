'use client'

interface TopUser { rank:number; userId:number; username:string; accuracy:number; points:number; currentStreak:number }

export default function TopThreePodium({ topThree, type }: { topThree:TopUser[]; type:'accuracy'|'streak'|'points' }) {
  if (topThree.length === 0) return null
  const typeLabel = type==='accuracy'?'准确率':type==='streak'?'连胜':'积分'
  const getValue = (u:TopUser) => {
    switch(type){ case'accuracy':return `${u.accuracy}%`; case'streak':return `${u.currentStreak}连`; case'points':return `${u.points}分` }
  }
  const order = [1,0,2]
  const heights = ['h-24','h-32','h-20']
  const medals = ['🥇','🥈','🥉']
  const bgGradients = [
    'linear-gradient(180deg, rgba(0,229,255,0.2), rgba(0,229,255,0.04))',
    'linear-gradient(180deg, rgba(168,85,247,0.2), rgba(168,85,247,0.04))',
    'linear-gradient(180deg, rgba(255,107,53,0.15), rgba(255,107,53,0.04))',
  ]

  return (
    <div className="flex items-end justify-center gap-4 mb-8 px-4">
      {order.map(idx => {
        const u = topThree[idx]; if(!u) return <div key={idx} className="flex-1" />
        return (
          <div key={u.userId} className="flex flex-col items-center flex-1 max-w-[140px]">
            <div className="text-3xl mb-2">{medals[idx]}</div>
            <div className="w-12 h-12 rounded-full border-2 border-[var(--neon-cyan)]/40 flex items-center justify-center text-lg font-bold text-[var(--neon-cyan)] mb-2"
              style={{ boxShadow:'0 0 16px rgba(0,229,255,0.12)' }}>
              {u.username.charAt(0)}
            </div>
            <p className="text-sm text-[var(--text-heading)] font-medium truncate max-w-full">{u.username}</p>
            <div className={`w-full ${heights[idx]} rounded-t-lg mt-2 flex flex-col items-center justify-center border border-[var(--neon-cyan)]/10 border-b-0`}
              style={{ background: bgGradients[idx] }}>
              <span className="kpi-number text-[1.25rem]">{getValue(u)}</span>
              <span className="text-xs text-[var(--text-label)] mt-1">{typeLabel}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
