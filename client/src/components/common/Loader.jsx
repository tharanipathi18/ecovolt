/**
 * Reusable Loader component.
 *
 * Types:
 * - spinner: Rotating ring (default)
 * - pulse: Pulsing glow dots
 * - skeleton: Content loading placeholder skeleton
 * - page: Full page center overlay loader
 */
export default function Loader({
  type = 'spinner',
  size = 'md',
  text,
  className = '',
}) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  if (type === 'page') {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-surface-700 border-t-primary-500 rounded-full animate-spin" />
          <div className="absolute w-6 h-6 bg-primary-500/20 rounded-full blur-sm animate-pulse" />
        </div>
        {text && <p className="mt-4 text-sm text-surface-400 font-medium animate-pulse">{text}</p>}
      </div>
    );
  }

  if (type === 'skeleton') {
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
        <div className="h-4 bg-surface-800 rounded-lg w-3/4" />
        <div className="h-4 bg-surface-800 rounded-lg w-full" />
        <div className="h-4 bg-surface-800 rounded-lg w-5/6" />
      </div>
    );
  }

  if (type === 'pulse') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <div className="w-2 h-2 rounded-full bg-primary-500 animate-ping" />
        <div className="w-2 h-2 rounded-full bg-primary-500 animate-ping delay-150" />
        <div className="w-2 h-2 rounded-full bg-primary-500 animate-ping delay-300" />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-surface-700 border-t-primary-500 rounded-full animate-spin`}
      />
      {text && <span className="text-sm text-surface-400">{text}</span>}
    </div>
  );
}
