/**
 * Reusable Badge component for statuses, tags, roles, and highlights.
 *
 * Variants:
 * - success: Green pill (online, active, completed)
 * - warning: Amber/Yellow pill (pending, maintenance)
 * - danger: Red pill (offline, error, failed)
 * - info: Blue pill (processing, active session)
 * - neutral: Gray pill
 * - primary: Electric green outline/fill
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
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    neutral: 'bg-surface-800 text-surface-300 border border-surface-700',
    primary: 'bg-primary-500/10 text-primary-400 border border-primary-500/30',
  };

  const dotColorClasses = {
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-red-400',
    info: 'bg-blue-400',
    neutral: 'bg-surface-400',
    primary: 'bg-primary-400',
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
