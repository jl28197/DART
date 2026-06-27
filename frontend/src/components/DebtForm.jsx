// The left panel. Handles debt entry, budget, goal, and strategy inputs.
// Lifts all state up to App.jsx via callback props (onXxxChange functions).

import { useState } from 'react'
import DebtList from './DebtList'
import {CirclePlus, Hourglass } from 'lucide-react'

const SAMPLE_DEBTS = [
  { name: 'Credit Card A', balance: 5400, annual_rate: 21.99, minimum_payment: 120, is_revolving: true  },
  { name: 'Credit Card B', balance: 2100, annual_rate: 17.99, minimum_payment: 55,  is_revolving: true  },
  { name: 'Student Loan',  balance: 18500, annual_rate: 6.85, minimum_payment: 210, is_revolving: false },
  { name: 'Car Loan',      balance: 11200, annual_rate: 5.99, minimum_payment: 225, is_revolving: false },
  { name: 'Personal Loan', balance: 3300,  annual_rate: 11.99, minimum_payment: 90, is_revolving: false },
]

export default function DebtForm({
  debts, onDebtsChange,
  budget, onBudgetChange,
  targetYears, onTargetYearsChange,
  targetMonths, onTargetMonthsChange,
  strategy, onStrategyChange,
  onSimulate,
  loading
}) {
  // Local state — only lives inside this component
  // because no other component needs to know about
  // the in-progress form fields
  const [form, setForm] = useState({
    name: '', balance: '', annual_rate: '', minimum_payment: '', is_revolving: false
  })
  const [formError, setFormError] = useState('')

  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleLoadSample() {
    onDebtsChange(SAMPLE_DEBTS)
    onBudgetChange(1100)
    onTargetYearsChange(5)
    onTargetMonthsChange(1)
    setFormError('')
  }

  function handleAddDebt(e) {
    e.preventDefault()
    setFormError('')

    const name       = form.name.trim()
    const balance    = parseFloat(form.balance)
    const rate       = parseFloat(form.annual_rate)
    const minPayment = parseFloat(form.minimum_payment)

  // ── Validation ─────────────────────────────────────────────────────────────
  if (!name)
    return setFormError('Please enter a name for this debt.')

  if (isNaN(balance) || balance <= 0)
    return setFormError('Balance must be a number greater than zero.')

  if (balance > 10000000)
    return setFormError('Balance seems unusually large. Please double-check.')

  if (isNaN(rate) || rate < 0)
    return setFormError('Interest rate cannot be negative.')

  if (rate > 60)
    return setFormError('Interest rate seems unusually high (above 60%). Please double-check.')

  if (isNaN(minPayment) || minPayment <= 0)
    return setFormError('Minimum payment must be greater than zero.')

  if (minPayment > balance)
    return setFormError('Minimum payment cannot exceed the current balance.')

  if (minPayment < 1)
    return setFormError('Minimum payment must be at least $1.')

  const duplicate = debts.find(d => d.name.toLowerCase() === name.toLowerCase())
  if (duplicate)
    return setFormError(`A debt named "${name}" already exists. Use a different name.`)

  // ── All checks passed ───────────────────────────────────────────────────────
  onDebtsChange([
    ...debts,
    {
      name,
      balance,
      annual_rate:     rate,
      minimum_payment: minPayment,
      is_revolving:    form.is_revolving
    }
  ])

  setForm({ name: '', balance: '', annual_rate: '', minimum_payment: '', is_revolving: false })
}

  function handleRemoveDebt(index) {
    onDebtsChange(debts.filter((_, i) => i !== index))
  }

  const totalMin = debts.reduce((sum, d) => sum + d.minimum_payment, 0)
  const budgetNum     = parseFloat(budget)
  const totalTarget   = targetYears * 12 + targetMonths
  const budgetValid   = !isNaN(budgetNum) && budgetNum >= totalMin && budgetNum > 0
  const canRun        = debts.length > 0 && budgetValid && totalTarget > 0

  return (
    <div className="form-panel">
      <h2>Your Debts</h2>

    <button
  type="button"
  className="btn-sample"
  onClick={handleLoadSample}
>
  Load Sample Data
</button>

      {debts.length > 0 && (
        <button
          type="button"
          className="btn-clear"
          onClick={() => { onDebtsChange([]); setFormError('') }}
        >
        Clear All
        </button>
      )}

      {/* Debt Entry Form */}
      <form onSubmit={handleAddDebt} className="debt-entry-form">
        <div className="form-row">
          <input
            name="name"
            placeholder="Debt name (e.g. Visa Card)"
            value={form.name}
            onChange={handleFormChange}
          />
        </div>
        <div className="form-row two-col">
          <input
            name="balance"
            type="number"
            placeholder="Balance ($)"
            value={form.balance}
            onChange={handleFormChange}
            min="0"
            step="1"
          />
          <input
            name="annual_rate"
            type="number"
            placeholder="Annual rate (%)"
            value={form.annual_rate}
            onChange={handleFormChange}
            min="0"
            max="100"
            step="0.01"
          />
        </div>
        <div className="form-row">
          <input
            name="minimum_payment"
            type="number"
            placeholder="Minimum monthly payment ($)"
            value={form.minimum_payment}
            onChange={handleFormChange}
            min="0"
            step="1"
          />
          <label style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input
              type="checkbox"
              checked={form.is_revolving}
              onChange={e => setForm({ ...form, is_revolving: e.target.checked })}
            />
            This is a credit card (revolving debt)
          </label>
        </div>

        {formError && <p className="error-text">{formError}</p>}

        <button type="submit" className="btn-secondary">
          <CirclePlus /> Add Debt
        </button>
      </form>

      <DebtList debts={debts} onRemove={handleRemoveDebt} />

      {/* Budget & Goal */}
      <div className="section">
        <h2>Budget & Goal</h2>

        <label>
          Monthly payment budget ($)
          {totalMin > 0 && (
            <span className="hint"> — minimum required: ${totalMin.toFixed(0)}</span>
          )}
        </label>
        <input
          type="number"
          value={budget}
          onChange={e => onBudgetChange(parseFloat(e.target.value) || '')}
          min={totalMin}
          step="50"
          placeholder="e.g. 800"
        />
<label>
  Debt-free target:{' '}
  <strong>
    {targetYears > 0 && `${targetYears} yr${targetYears !== 1 ? 's' : ''}`}
    {targetYears > 0 && targetMonths > 0 && ' '}
    {targetMonths > 0 && `${targetMonths} mo`}
    {targetYears === 0 && targetMonths === 0 && 'Select a target'}
  </strong>
</label>

<label style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
  Years
</label>
<input
  type="range"
  min="0" max="30"
  value={targetYears}
  onChange={e => onTargetYearsChange(parseInt(e.target.value))}
/>
<div className="range-labels">
  <span>0 yrs</span><span>30 yrs</span>
</div>

<label style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
  Months (0–11)
</label>
<input
  type="range"
  min="0" max="11"
  value={targetMonths}
  onChange={e => onTargetMonthsChange(parseInt(e.target.value))}
/>
<div className="range-labels">
  <span>0 mo</span><span>11 mo</span>
</div>
      </div>

      {/* Strategy */}
      <div className="section">
        <h2>Strategy</h2>
        <div className="strategy-options">
          {[
            { value: 'avalanche', label: 'Avalanche', sub: 'Highest APR first' },
            { value: 'snowball',  label: 'Snowball',  sub: 'Lowest balance first' },
          ].map(opt => (
            <div
              key={opt.value}
              className={`strategy-card ${strategy === opt.value ? 'selected' : ''}`}
              onClick={() => onStrategyChange(opt.value)}
            >
              <strong>{opt.label}</strong>
              <p>{opt.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Run button */}
      <button
        className="btn-primary"
        onClick={onSimulate}
        disabled={!canRun || loading}
      >
        {loading ? (
          <><Hourglass size={16} /> Running...</>
      ) : (
        '▶ Run Simulation'
      )}
      </button>

      {!canRun && debts.length > 0 && (
        <p className="error-text">
          Budget must be at least ${totalMin.toFixed(0)}/mo to cover all minimums.
        </p>
      )}
    </div>
  )
}