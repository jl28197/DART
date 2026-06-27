// App.jsx
// Root component. Owns all shared state and orchestrates
// the two main panels and API calls.

import { useState } from 'react'
import DebtForm     from './components/DebtForm'
import ResultsPanel from './components/ResultsPanel'
import { runSimulation, runSensitivity, runComparison } from './api/client'
import './App.css'
import SkeletonLoader from './components/SkeletonLoader'

export default function App() {

  // ── Shared state ────────────────────────────────────────────────────────────
  const [debts,        setDebts]        = useState([])
  const [budget,       setBudget]       = useState('')
  const [targetYears,   setTargetYears]   = useState(5)
  const [targetMonths,  setTargetMonths]  = useState(0)
  const [strategy,     setStrategy]     = useState('avalanche')

  const [results,      setResults]      = useState(null)
  const [sensitivity,  setSensitivity]  = useState(null)
  const [comparison,   setComparison]   = useState(null)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState(null)
  const n_simulations = 5000

  // ── Simulation handler ───────────────────────────────────────────────────────
  async function handleSimulate() {
    setLoading(true)
    setError(null)
    setResults(null)
    setSensitivity(null)
    setComparison(null)

    const payload = {
      debts,
      monthly_budget: parseFloat(budget),
      target_months:  (targetYears * 12)+targetMonths,
      strategy,
      n_simulations
    }

    try {
      // Fire all three API calls in parallel using Promise.all
      // This is faster than waiting for each one sequentially
      const [simData, sensData, compData] = await Promise.all([
        runSimulation(payload),
        runSensitivity(payload),
        runComparison(payload)
      ])

      setResults(simData)
      setSensitivity(sensData)
      setComparison(compData)

    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="app-layout">

      <header className="app-header">
        <h1>D.A.R.T</h1>
        <p>Debt Analysis and Repayment Tool</p>
      </header>

      <main className="app-main">
        <aside className="left-panel">
          <DebtForm
            debts={debts}              onDebtsChange={setDebts}
            budget={budget}            onBudgetChange={setBudget}
            targetYears={targetYears}  onTargetYearsChange={setTargetYears}
            targetMonths={targetMonths} onTargetMonthsChange={setTargetMonths}
            strategy={strategy}        onStrategyChange={setStrategy}
            onSimulate={handleSimulate}
            loading={loading}
          />
        </aside>

        <section className="right-panel">
          {error && (
            <div className="error-banner">⚠️ {error}</div>
          )}
          {loading && <SkeletonLoader />}

          {results && !loading && (
            <ResultsPanel
                results={results}
                sensitivity={sensitivity}
                comparison={comparison}
                targetYears={targetYears}
                targetMonths={targetMonths}
            />
          )}

          {!results && !loading && !error && (
            <div className="empty-results">
              <p>Add your debts and click <strong>Run Simulation</strong> to see your results.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}