// Side-by-side avalanche vs snowball comparison table.

import {Lightbulb, MoveUp, MoveDown } from 'lucide-react'

function formatMonths(m) {
  const yrs = Math.floor(m / 12)
  const mo  = m % 12
  if (yrs === 0) return `${mo}mo`
  if (mo  === 0) return `${yrs}yr`
  return `${yrs}yr ${mo}mo`
}

export default function ComparisonTable({ comparison }) {
  if (!comparison) return null

  const { avalanche: av, snowball: sn } = comparison
  const interestSaved = sn.total_interest - av.total_interest
  const monthsSaved   = sn.total_months   - av.total_months

  const rows = [
    { label: 'Payoff Time',     av: formatMonths(av.total_months),              sn: formatMonths(sn.total_months) },
    { label: 'Total Paid',      av: `$${av.total_paid.toLocaleString()}`,        sn: `$${sn.total_paid.toLocaleString()}` },
    { label: 'Total Interest',  av: `$${av.total_interest.toLocaleString()}`,    sn: `$${sn.total_interest.toLocaleString()}` },
  ]

  return (
    <div className="table-container">
      <h3>Strategy Comparison</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th></th>
            <th><MoveUp /> Avalanche</th>
            <th><MoveDown /> Snowball</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.label}>
              <td><strong>{row.label}</strong></td>
              <td>{row.av}</td>
              <td>{row.sn}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {interestSaved > 0 && (
        <p className="insight-text">
          <Lightbulb /> Avalanche saves <strong>${interestSaved.toLocaleString()}</strong> in interest
          and pays off <strong>{formatMonths(monthsSaved)}</strong> faster.
        </p>
      )}
    </div>
  )
}