import { forwardRef } from 'react';

/**
 * Reusable Button component.
 *
 * Variants:
 * - primary: Solid electric green gradient
 * - secondary: Solid tech blue
 * - outline: Border with hover background
 * - ghost: Transparent with hover background
 * - danger: Red for destructive actions
 * - success: Green badge/button
 *
 * Sizes: sm | md | lg
 */
const Button = forwardRef(function Button(
  {
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    isDisabled = false,
    leftIcon = null,
    rightIcon = null,
    fullWidth = false,
    className = '',
    onClick,
    ...props
  },
  ref,
) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-900 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/35 focus:ring-primary-500 active:scale-[0.98]',
    secondary:
      'bg-surface-800 hover:bg-surface-700 text-white border border-surface-700 hover:border-surface-600 focus:ring-secondary-500 active:scale-[0.98]',
    outline:
      'border border-primary-500/50 text-primary-400 hover:bg-primary-500/10 hover:border-primary-500 focus:ring-primary-500 active:scale-[0.98]',
    ghost:
      'text-surface-300 hover:text-white hover:bg-surface-800/60 focus:ring-surface-500',
    danger:
      'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold shadow-lg shadow-red-500/20 focus:ring-red-500 active:scale-[0.98]',
    success:
      'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 focus:ring-emerald-500',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled || isLoading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
});

export default Button;
