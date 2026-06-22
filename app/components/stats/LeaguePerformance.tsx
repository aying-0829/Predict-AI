'use client'

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'

interface LeagueData {
  league: string
  accuracy: number
  fullMark: number
}

function generateLeagueData(): LeagueData[] {
  return [
    { league: '英超', accuracy: 74, fullMark: 100 },
    { league: '西甲', accuracy: 69, fullMark: 100 },
    { league: '意甲', accuracy: 72, fullMark: 100 },
    { league: '德甲', accuracy: 76, fullMark: 100 },
    { league: '法甲', accuracy: 65, fullMark: 100 },
    { league: '世界杯', accuracy: 78, fullMark: 100 },
  ]
}

export default function LeaguePerformance() {
  const data = generateLeagueData()

  return (
    <div className="bg-[#0c0c18] border border-[rgba(0,229,255,0.1)] rounded-lg p-5">
      <h3 className="text-sm font-semibold text-[#e8e8f0] mb-2">各联赛预测准确率</h3>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#2a2520" />
          <PolarAngleAxis dataKey="league" tick={{ fontSize: 11, fill: '#8a7a50' }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#8a7a50' }} tickCount={5} />
          <Radar
            name="准确率"
            dataKey="accuracy"
            stroke="var(--neon-cyan)"
            fill="var(--neon-cyan)"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#201c18', border: '1px solid #8a7a50', borderRadius: 8, fontSize: 12 }}
            formatter={(val: any) => [`${val}%`, '准确率']}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
