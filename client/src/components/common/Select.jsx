import { forwardRef } from 'react';

/**
 * Reusable Select Dropdown component.
 *
 * Options array format: [{ value: 'x', label: 'X' }] or strings.
 */
const Select = forwardRef(function Select(
  {
    label,
    options = [],
    error,
    helperText,
    fullWidth = true,
    className = '',
    id,
    placeholder = 'Select an option...',
    ...props
  },
  ref,
) {
  const selectId = id || props.name;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-surface-300 mb-1.5">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={`w-full py-2.5 pl-4 pr-10 bg-surface-800 border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all appearance-none cursor-pointer ${
            error ? 'border-red-500/60 focus:ring-red-500/30' : 'border-surface-700 hover:border-surface-600'
          }`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="bg-surface-800 text-surface-500">
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const value = typeof opt === 'object' ? opt.value : opt;
            const optionLabel = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={value} value={value} className="bg-surface-800 text-white">
                {optionLabel}
              </option>
            );
          })}
        </select>

        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-surface-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-red-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-surface-500">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Select;
