/**
 * Reusable Card container component.
 *
 * Variants:
 * - glass: Glassmorphism translucent card with subtle border and backdrop blur (default)
 * - solid: Solid dark card surface
 * - outline: Subtle border container
 * - glow: Primary green ambient glow background border
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
  const baseClasses = 'rounded-2xl transition-all duration-300 relative overflow-hidden';

  const variantClasses = {
    glass: 'bg-white/5 backdrop-blur-lg border border-white/10 text-surface-100',
    solid: 'bg-surface-800/80 border border-surface-700/80 text-surface-100',
    outline: 'bg-transparent border border-surface-700 text-surface-100',
    glow: 'bg-surface-900/90 border border-primary-500/30 glow-primary text-surface-100',
  };

  const paddingClasses = {
    none: '',
    compact: 'p-4',
    normal: 'p-6',
    spacious: 'p-8',
  };

  const hoverClass = hover
    ? 'hover:border-primary-500/40 hover:shadow-xl hover:shadow-primary-500/5 hover:-translate-y-0.5 cursor-pointer'
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
    <div className={`flex items-center justify-between pb-4 mb-4 border-b border-surface-700/50 ${className}`}>
      <div>
        {title && <h3 className="text-lg font-semibold text-white tracking-tight">{title}</h3>}
        {subtitle && <p className="text-xs text-surface-400 mt-0.5">{subtitle}</p>}
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
    <div className={`pt-4 mt-4 border-t border-surface-700/50 flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
}
