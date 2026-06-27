// Four summary stat boxes displayed in a row at the top of results.

function MetricBox({ label, value, sub }) {
  return (
    <div className="metric-box">
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  )
}

function formatMonths(m) {
  const yrs = Math.floor(m / 12)
  const mo  = m % 12
  if (yrs === 0) return `${mo}mo`
  if (mo  === 0) return `${yrs}yr`
  return `${yrs}yr ${mo}mo`
}

function formatCurrency(n) {
  return '$' + n.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function MetricsRow({ results }) {
  const { total_months, total_paid, total_interest, median_months } = results
  return (
    <div className="metrics-row">
      <MetricBox label="Payoff Time"      value={formatMonths(total_months)}  sub="base case" />
      <MetricBox label="Total Paid"       value={formatCurrency(total_paid)}               />
      <MetricBox label="Total Interest"   value={formatCurrency(total_interest)}            />
      <MetricBox label="Median (sim.)"    value={formatMonths(median_months)}  sub="Monte Carlo" />
    </div>
  )
}