'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface BreakdownData {
  name: string
  value: number
  color: string
}

function generateBreakdown(): BreakdownData[] {
  return [
    { name: '主胜预测', value: 145, color: 'var(--neon-cyan)' },
    { name: '平局预测', value: 82, color: '#8a7a50' },
    { name: '客胜预测', value: 115, color: '#4ade80' },
  ]
}

const RADIAN = Math.PI / 180

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function PredictionBreakdown() {
  const data = generateBreakdown()
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="bg-[#0c0c18] border border-[rgba(0,229,255,0.1)] rounded-lg p-5">
      <h3 className="text-sm font-semibold text-[#e8e8f0] mb-1">预测分布</h3>
      <p className="text-xs text-[#505870] mb-3">总预测 {total} 次</p>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel}
          >
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#201c18', border: '1px solid #8a7a50', borderRadius: 8, fontSize: 12 }}
            formatter={(val: any, name: any) => [val, name]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(val: string) => <span className="text-[#9098b0]">{val}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
