import { forwardRef } from 'react';

/**
 * Reusable Button component.
 *
 * Variants:
 * - primary: Deep forest green solid button
 * - secondary: White / light surface button with subtle border
 * - outline: Forest green border with light tint hover
 * - ghost: Transparent with slate hover
 * - danger: Muted red for destructive actions
 * - success: Natural emerald green button
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
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-emerald-800 hover:bg-emerald-900 text-white font-semibold shadow-sm hover:shadow focus:ring-emerald-700 active:scale-[0.99]',
    secondary:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 focus:ring-slate-300 active:scale-[0.99] shadow-2xs',
    outline:
      'border border-emerald-700/60 text-emerald-800 hover:bg-emerald-50 focus:ring-emerald-700 active:scale-[0.99]',
    ghost:
      'text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-300',
    danger:
      'bg-red-600 hover:bg-red-700 text-white font-semibold shadow-sm focus:ring-red-500 active:scale-[0.99]',
    success:
      'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300/60 focus:ring-emerald-700',
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

