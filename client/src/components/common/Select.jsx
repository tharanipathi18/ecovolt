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
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={`w-full py-2.5 pl-4 pr-10 bg-white border rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all appearance-none cursor-pointer ${
            error ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 hover:border-slate-300'
          }`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="bg-white text-slate-400">
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const value = typeof opt === 'object' ? opt.value : opt;
            const optionLabel = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={value} value={value} className="bg-white text-slate-900">
                {optionLabel}
              </option>
            );
          })}
        </select>

        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Select;

