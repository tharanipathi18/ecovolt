import { useState } from 'react';
import Card from '../common/Card';

/**
 * Reusable Chart Container Card wrapper.
 *
 * Provides:
 * - Header with title & subtitle
 * - Time period tabs (24h, 7d, 30d, 1y)
 * - Stat summary highlight numbers
 * - Full responsive wrapper container for charts
 */
export default function ChartCard({
  title,
  subtitle,
  children,
  periods = ['24h', '7d', '30d', '1y'],
  defaultPeriod = '24h',
  onPeriodChange,
  stats,
  action,
  className = '',
}) {
  const [activePeriod, setActivePeriod] = useState(defaultPeriod);

  const handlePeriodClick = (p) => {
    setActivePeriod(p);
    if (onPeriodChange) onPeriodChange(p);
  };

  return (
    <Card variant="glass" padding="normal" className={`flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-surface-700/50">
        <div>
          {title && <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>}
          {subtitle && <p className="text-xs text-surface-400 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Time Period Filter Tabs */}
          {periods && periods.length > 0 && (
            <div className="flex items-center p-1 bg-surface-800/80 rounded-xl border border-surface-700">
              {periods.map((period) => (
                <button
                  key={period}
                  onClick={() => handlePeriodClick(period)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                    activePeriod === period
                      ? 'bg-primary-600 text-white shadow'
                      : 'text-surface-400 hover:text-white'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          )}

          {action}
        </div>
      </div>

      {/* Stats Summary Line (Optional) */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 rounded-xl bg-surface-800/40 border border-surface-700/50">
          {stats.map((st, i) => (
            <div key={i}>
              <p className="text-[11px] font-medium text-surface-400 uppercase tracking-wider">{st.label}</p>
              <p className="text-lg font-bold text-white mt-0.5">{st.value}</p>
              {st.change && (
                <span className={`text-xs font-medium ${st.isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                  {st.change}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Chart Canvas / Render Area */}
      <div className="flex-1 w-full min-h-[300px] flex items-center justify-center">
        {children}
      </div>
    </Card>
  );
}
