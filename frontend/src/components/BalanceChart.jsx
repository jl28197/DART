// Line chart showing each debt's balance declining over time.

import { LineChart, Line, XAxis, YAxis, Tooltip,
         Legend, ResponsiveContainer, CartesianGrid } from 'recharts'

const COLORS = ['#3b82f6','#ef4444','#22c55e','#f59e0b','#a855f7','#ec4899']

export default function BalanceChart({ balanceOverTime }) {
  if (!balanceOverTime || balanceOverTime.length === 0) return null

  // Transform the [{month, balances: {name: value}}] structure
  // into [{month, "Credit Card": 5200, "Student Loan": 18100, ...}]
  // which is the flat format Recharts expects
  const data      = balanceOverTime.map(entry => ({
    month: entry.month,
    ...entry.balances
  }))
  const debtNames = Object.keys(balanceOverTime[0].balances)

  return (
    <div className="chart-container">
      <h3>Balance Over Time</h3>
      <p className="chart-sub">How each debt decreases under your chosen strategy</p>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            label={{ value: 'Month', position: 'insideBottom', offset: -5 }}
          />
          <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
          <Tooltip formatter={v => [`$${v.toLocaleString()}`, '']} />
          <Legend />
          {debtNames.map((name, i) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={COLORS[i % COLORS.length]}
              dot={false}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}