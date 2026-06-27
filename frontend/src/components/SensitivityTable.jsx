// Shows how probability changes across different budget levels.

function formatMonths(m) {
  if (!m) return '—'
  const yrs = Math.floor(m / 12)
  const mo  = m % 12
  if (yrs === 0) return `${mo}mo`
  if (mo  === 0) return `${yrs}yr`
  return `${yrs}yr ${mo}mo`
}

export default function SensitivityTable({ rows }) {
  if (!rows || rows.length === 0) return null

  return (
    <div className="table-container">
      <h3>Budget Sensitivity</h3>
      <p className="chart-sub">How your probability changes with different monthly budgets</p>
      <table className="data-table">
        <thead>
          <tr>
            <th>Monthly Budget</th>
            <th>Probability</th>
            <th>Median Payoff</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={row.is_user_budget ? 'highlight-row' : ''}>
              <td>${row.budget.toLocaleString()}</td>
              <td>
                {row.error
                  ? <span className="error-text">Below minimums</span>
                  : <span className={
                      row.probability >= 75 ? 'prob-high'
                    : row.probability >= 45 ? 'prob-medium'
                    : 'prob-low'
                    }>
                      {row.probability}%
                    </span>
                }
              </td>
              <td>{formatMonths(row.median_months)}</td>
              <td>{row.is_user_budget ? '← your budget' : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}