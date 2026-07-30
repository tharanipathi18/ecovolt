import { forwardRef } from 'react';

/**
 * Reusable Form Input component.
 */
const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    fullWidth = true,
    className = '',
    id,
    type = 'text',
    ...props
  },
  ref,
) {
  const inputId = id || props.name;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-surface-300 mb-1.5">
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-500">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`w-full py-2.5 bg-surface-800/60 border rounded-xl text-white placeholder-surface-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all ${
            leftIcon ? 'pl-11' : 'pl-4'
          } ${rightIcon ? 'pr-11' : 'pr-4'} ${
            error ? 'border-red-500/60 focus:ring-red-500/30' : 'border-surface-700 hover:border-surface-600'
          }`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-surface-500">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-red-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-surface-500">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Input;
