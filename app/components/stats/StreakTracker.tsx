'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts'

interface StreakData {
  name: string
  wins: number
  losses: number
}

// Fixed seed streak data for realistic display
const seedStreakData: StreakData[] = [
  { name: '1月', wins: 5, losses: 2 },
  { name: '2月', wins: 3, losses: 4 },
  { name: '3月', wins: 7, losses: 1 },
  { name: '4月', wins: 4, losses: 3 },
  { name: '5月', wins: 6, losses: 2 },
  { name: '6月', wins: 8, losses: 1 },
]

function generateStreakData(): StreakData[] {
  return seedStreakData
}

export default function StreakTracker() {
  const data = generateStreakData()
  const bestStreak = Math.max(...data.map(d => d.wins))
  const worstStreak = Math.max(...data.map(d => d.losses))

  return (
    <div className="bg-[#0c0c18] border border-[rgba(0,229,255,0.1)] rounded-lg p-5">
      <h3 className="text-sm font-semibold text-[#e8e8f0] mb-1">连胜/连败追踪</h3>
      <div className="flex gap-6 mb-4">
        <div>
          <span className="text-xs text-[#505870]">最长连胜</span>
          <p className="text-lg font-numeric text-green-400">{bestStreak}</p>
        </div>
        <div>
          <span className="text-xs text-[#505870]">最长连败</span>
          <p className="text-lg font-numeric text-red-400">{worstStreak}</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2520" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8a7a50' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#8a7a50' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#201c18', border: '1px solid #8a7a50', borderRadius: 8, fontSize: 12 }}
          />
          <Bar dataKey="wins" name="连胜" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={`win-${i}`} fill="#4ade80" fillOpacity={0.7} />
            ))}
          </Bar>
          <Bar dataKey="losses" name="连败" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={`loss-${i}`} fill="#f87171" fillOpacity={0.7} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
