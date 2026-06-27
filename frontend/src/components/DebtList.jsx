// Renders the list of debts the user has already added,
// with a remove button on each one.

export default function DebtList({ debts, onRemove }) {
  if (debts.length === 0) {
    return <p className="empty-state">No debts added yet.</p>
  }

  const totalBalance = debts.reduce((sum, d) => sum + d.balance, 0)
  const totalMin     = debts.reduce((sum, d) => sum + d.minimum_payment, 0)

  return (
    <div className="debt-list">
      {debts.map((debt, index) => (
        <div key={index} className="debt-row">
          <div className="debt-info">
            <span className="debt-name">{debt.name}</span>
            <span className="debt-detail">
              ${debt.balance.toLocaleString()} @ {debt.annual_rate}%
            </span>
          </div>
          <button
            className="remove-btn"
            onClick={() => onRemove(index)}
            aria-label={`Remove ${debt.name}`}
          >
            ✕
          </button>
        </div>
      ))}
      <div className="debt-totals">
        <span>Total: ${totalBalance.toLocaleString()}</span>
        <span>Min/mo: ${totalMin.toLocaleString()}</span>
      </div>
    </div>
  )
}