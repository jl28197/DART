// Monte Carlo distribution — rendered using Recharts.
// Bins the raw simulation data into buckets, then draws a bar chart.

import { BarChart, Bar, XAxis, YAxis, Tooltip,
         ReferenceLine, ResponsiveContainer, CartesianGrid } from 'recharts'

function buildBins(data, binCount = 40) {
  const min   = Math.min(...data)
  const max   = Math.max(...data)
  const width = Math.ceil((max - min) / binCount)
  const bins  = []

  for (let i = 0; i < binCount; i++) {
    const lo = min + i * width
    const hi = lo + width
    bins.push({
      range: lo,
      count: data.filter(v => v >= lo && v < hi).length,
      label: `${lo}–${hi} mo`
    })
  }
  return bins
}

export default function HistogramChart({ histogramData, targetMonths, mc }) {
  const bins = buildBins(histogramData)

  return (
    <div className="chart-container">
      <h3>Simulated Payoff Timeline</h3>
      <p className="chart-sub">
        Distribution of payoff times across {histogramData.length.toLocaleString()} simulated futures
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={bins} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="range"
            label={{ value: 'Months', position: 'insideBottom', offset: -5 }}
          />
          <YAxis />
          <Tooltip
            formatter={(val) => [val, 'Simulations']}
            labelFormatter={(l) => `~${l} months`}
          />
          <Bar dataKey="count" fill="#3b82f6" radius={[3, 3, 0, 0]} />

          {/* Reference lines for key percentiles and user's goal */}
          <ReferenceLine x={mc.median_months} stroke="#f59e0b" strokeWidth={2}
            label={{ value: 'Median', fill: '#f59e0b', fontSize: 11 }} />
          <ReferenceLine x={mc.p10_months} stroke="#22c55e" strokeDasharray="4 4"
            label={{ value: 'P10', fill: '#22c55e', fontSize: 11 }} />
          <ReferenceLine x={mc.p90_months} stroke="#ef4444" strokeDasharray="4 4"
            label={{ value: 'P90', fill: '#ef4444', fontSize: 11 }} />
          <ReferenceLine x={targetMonths} stroke="#a855f7" strokeWidth={2}
            label={{ value: 'Your goal', fill: '#a855f7', fontSize: 11 }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}