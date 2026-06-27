// SkeletonLoader.jsx
// Displays ghost versions of the result cards while simulation is running.
// Gives the user a sense of what's coming and where it will appear.

export default function SkeletonLoader() {
  return (
    <div className="skeleton-wrapper">

      {/* Metrics row — 4 boxes */}
      <div className="skeleton-metrics-row">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton-metric-box">
            <div className="skeleton-block skeleton-value" />
            <div className="skeleton-block skeleton-label" />
          </div>
        ))}
      </div>

      {/* Feasibility card */}
      <div className="skeleton-feasibility">
        <div className="skeleton-block skeleton-prob" />
        <div className="skeleton-block skeleton-sublabel" />
        <div className="skeleton-range-row">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-range-item">
              <div className="skeleton-block skeleton-range-label" />
              <div className="skeleton-block skeleton-range-value" />
            </div>
          ))}
        </div>
      </div>

      {/* Two chart placeholders */}
      <div className="skeleton-charts-row">
        {[1, 2].map(i => (
          <div key={i} className="skeleton-chart-box">
            <div className="skeleton-block skeleton-chart-title" />
            <div className="skeleton-block skeleton-chart-body" />
          </div>
        ))}
      </div>

      {/* Two table placeholders */}
      <div className="skeleton-charts-row">
        {[1, 2].map(i => (
          <div key={i} className="skeleton-chart-box">
            <div className="skeleton-block skeleton-chart-title" />
            {[1, 2, 3, 4, 5].map(j => (
              <div key={j} className="skeleton-block skeleton-table-row" />
            ))}
          </div>
        ))}
      </div>

    </div>
  )
}