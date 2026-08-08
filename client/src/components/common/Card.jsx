/**
 * Reusable Card container component.
 *
 * Variants:
 * - glass / solid: White card surface with subtle border and soft shadow (default)
 * - outline: Light slate border container
 * - glow: Subtle emerald accent border container
 */
export default function Card({
  children,
  variant = 'glass',
  padding = 'normal',
  hover = false,
  className = '',
  onClick,
  ...props
}) {
  const baseClasses = 'rounded-2xl transition-all duration-200 relative overflow-hidden';

  const variantClasses = {
    glass: 'bg-white border border-slate-200/80 text-slate-800 shadow-sm',
    solid: 'bg-white border border-slate-200 text-slate-800 shadow-sm',
    outline: 'bg-slate-50/50 border border-slate-200 text-slate-800',
    glow: 'bg-white border border-emerald-600/30 text-slate-800 shadow-sm',
  };

  const paddingClasses = {
    none: '',
    compact: 'p-4',
    normal: 'p-6',
    spacious: 'p-8',
  };

  const hoverClass = hover
    ? 'hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
    : '';

  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Card Header subcomponent
 */
export function CardHeader({ children, title, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-center justify-between pb-4 mb-4 border-b border-slate-100 ${className}`}>
      <div>
        {title && <h3 className="text-lg font-semibold text-slate-900 tracking-tight">{title}</h3>}
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        {children}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/**
 * Card Body subcomponent
 */
export function CardBody({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

/**
 * Card Footer subcomponent
 */
export function CardFooter({ children, className = '' }) {
  return (
    <div className={`pt-4 mt-4 border-t border-slate-100 flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
}

