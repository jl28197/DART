// Assembles all result components into a single panel.
// This component receives the raw API response and distributes
// the right data to each child component.

import MetricsRow       from './MetricsRow'
import FeasibilityCard  from './FeasibilityCard'
import HistogramChart   from './HistogramChart'
import BalanceChart     from './BalanceChart'
import SensitivityTable from './SensitivityTable'
import ComparisonTable  from './ComparisonTable'

export default function ResultsPanel({ results, sensitivity, comparison, targetYears, targetMonths = 0 }) {
  return (
    <div className="results-panel">
      <h2>Results</h2>

      <MetricsRow results={results} />

      <FeasibilityCard results={results} targetYears={targetYears} targetMonths={targetMonths} />

      <div className="charts-row">
        <HistogramChart
          histogramData={results.histogram_data}
          targetMonths={targetYears * 12}
          mc={results}
        />
        <BalanceChart balanceOverTime={results.balance_over_time} />
      </div>

      <div className="tables-row">
        <SensitivityTable rows={sensitivity?.rows} />
        <ComparisonTable  comparison={comparison} />
      </div>
    </div>
  )
}