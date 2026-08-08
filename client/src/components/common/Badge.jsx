/**
 * Reusable Badge component for statuses, tags, roles, and highlights.
 *
 * Variants:
 * - success: Natural emerald pill (online, active, completed)
 * - warning: Warm amber pill (pending, maintenance)
 * - danger: Soft rose pill (offline, error, failed)
 * - info: Sky blue pill (processing, active session)
 * - neutral: Muted slate pill
 * - primary: Forest green pill
 */
export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  pulse = false,
  className = '',
}) {
  const baseClasses = 'inline-flex items-center font-medium rounded-full tracking-wide';

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  const variantClasses = {
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200/80',
    danger: 'bg-rose-50 text-rose-800 border border-rose-200/80',
    info: 'bg-sky-50 text-sky-800 border border-sky-200/80',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    primary: 'bg-emerald-50 text-emerald-900 border border-emerald-300',
  };

  const dotColorClasses = {
    success: 'bg-emerald-600',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-sky-600',
    neutral: 'bg-slate-400',
    primary: 'bg-emerald-700',
  };

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {dot && (
        <span className="relative flex h-2 w-2 shrink-0">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColorClasses[variant]}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColorClasses[variant]}`} />
        </span>
      )}
      {children}
    </span>
  );
}

