import { forwardRef } from 'react';

/**
 * Reusable Textarea component.
 */
const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    helperText,
    rows = 4,
    fullWidth = true,
    className = '',
    id,
    ...props
  },
  ref,
) {
  const textareaId = id || props.name;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-surface-300 mb-1.5">
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`w-full p-3.5 bg-surface-800/60 border rounded-xl text-white placeholder-surface-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all ${
          error ? 'border-red-500/60 focus:ring-red-500/30' : 'border-surface-700 hover:border-surface-600'
        }`}
        {...props}
      />

      {error ? (
        <p className="mt-1.5 text-xs text-red-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-surface-500">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Textarea;
