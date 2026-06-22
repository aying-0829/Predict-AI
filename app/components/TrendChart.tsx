'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type TrendPoint = { date: string; hitCount: number; detail: string }

export default function TrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0d5c8" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#a89880' }}
          tickFormatter={(v: string) => v.slice(5)}
        />
        <YAxis tick={{ fontSize: 11, fill: '#a89880' }} domain={[0, 'auto']} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e0d5c8',
            borderRadius: 8,
            fontSize: 12,
          }}
          labelFormatter={(v) => `日期: ${v}`}
          formatter={(_value, _name, props) => {
            const p = props as unknown as { payload: TrendPoint }
            return [`${_value} 命中`, p.payload.detail]
          }}
        />
        <Line
          type="monotone"
          dataKey="hitCount"
          stroke="#c89638"
          strokeWidth={2}
          dot={{ fill: '#c89638', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
