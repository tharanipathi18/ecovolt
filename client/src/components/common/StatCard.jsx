import Card from './Card';
import Badge from './Badge';

/**
 * Metric / Stat Card component for key dashboard metrics.
 *
 * Props:
 * - title: Metric label (e.g. "Total Energy Generated")
 * - value: Primary metric display value (e.g. "1,420 kWh")
 * - change: Percentage or value change string (e.g. "+12.4%")
 * - changeType: 'increase' | 'decrease' | 'neutral'
 * - icon: SVG or JSX icon
 * - periodText: Context label (e.g. "vs last 24h")
 */
export default function StatCard({
  title,
  value,
  change,
  changeType = 'increase',
  icon,
  periodText = 'vs last 24h',
  badgeText,
  badgeVariant = 'primary',
  className = '',
}) {
  const isIncrease = changeType === 'increase';
  const isDecrease = changeType === 'decrease';

  return (
    <Card variant="glass" padding="normal" hover className={`relative overflow-hidden ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-1">{title}</p>
          <h4 className="text-2xl font-extrabold text-white tracking-tight">{value}</h4>
        </div>

        {icon && (
          <div className="p-3 rounded-xl bg-surface-800/80 border border-surface-700 text-primary-400 shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between pt-3 border-t border-surface-700/40">
        <div className="flex items-center gap-1.5 text-xs">
          {change && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold ${
                isIncrease ? 'text-emerald-400' : isDecrease ? 'text-red-400' : 'text-surface-400'
              }`}
            >
              {isIncrease && (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
              {isDecrease && (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              {change}
            </span>
          )}
          <span className="text-surface-500">{periodText}</span>
        </div>

        {badgeText && <Badge variant={badgeVariant} size="sm">{badgeText}</Badge>}
      </div>
    </Card>
  );
}
