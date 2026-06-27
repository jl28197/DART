// The centrepiece card showing the probability percentage
// and a confidence label with contextual advice.
import { CheckCircle, AlertTriangle, XCircle, ArrowDown, Minus, ArrowUp } from 'lucide-react'

function formatMonths(m) {
  const yrs = Math.floor(m / 12)
  const mo  = m % 12
  if (yrs === 0) return `${mo} month${mo !== 1 ? 's' : ''}`
  if (mo  === 0) return `${yrs} year${yrs !== 1 ? 's' : ''}`
  return `${yrs} yr ${mo} mo`
}

export default function FeasibilityCard({ results, targetYears, targetMonths = 0 }) {
  const { probability, p10_months, median_months, p90_months } = results

  const level = probability >= 75 ? 'high' : probability >= 45 ? 'medium' : 'low'
  const badgeIcon = {
  high:   <CheckCircle  size={14} />,
  medium: <AlertTriangle size={14} />,
  low:    <XCircle      size={14} />
  }[level]
  const badgeText = { high: 'High', medium: 'Moderate', low: 'Low' }[level]

  const advice = {
    high:   'Your goal is very achievable at this budget. Consider whether you can increase payments further to save even more in interest.',
    medium: 'Your goal is possible but not guaranteed. A rate increase or unexpected expense could push you past your target — consider a small buffer.',
    low:    `This goal may be ambitious at this budget. Based on your current payments, a more realistic target is around ${formatMonths(median_months)}.`
  }[level]

  return (
    <div className={`feasibility-card feasibility-${level}`}>
      <div className="feasibility-header">
        <div>
          <div className="feasibility-prob">{probability}%</div>
          <div className="feasibility-label">
            probability of being debt-free within{' '}
              {targetYears > 0 && `${targetYears} yr${targetYears !== 1 ? 's' : ''} `}
              {targetMonths > 0 && `${targetMonths} mo`}
          </div>
        </div>
        <div className={`confidence-badge badge-${level}`}>
        {badgeIcon} {badgeText}
        </div>
      </div>

      <div className="feasibility-range">
        <div className="range-item best">
          <span><ArrowDown size={13} color="#16a34a" /> Best (10th pct)</span>
          <strong>{formatMonths(p10_months)}</strong>
        </div>
    <div className="range-item median">
      <span><Minus size={13} color="#d97706" /> Median</span>
      <strong>{formatMonths(median_months)}</strong>
    </div>
      <div className="range-item worst">
        <span><ArrowUp size={13} color="#dc2626" /> Worst (90th pct)</span>
          <strong>{formatMonths(p90_months)}</strong>
        </div>
      </div>

      <p className="feasibility-advice">{advice}</p>
    </div>
  )
}