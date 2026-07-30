import { forwardRef } from 'react';

/**
 * Reusable Toggle Switch component.
 */
const Toggle = forwardRef(function Toggle(
  {
    label,
    description,
    checked = false,
    onChange,
    isDisabled = false,
    className = '',
    id,
    ...props
  },
  ref,
) {
  const toggleId = id || props.name;

  return (
    <label htmlFor={toggleId} className={`inline-flex items-center gap-3 cursor-pointer select-none ${className}`}>
      <div className="relative">
        <input
          ref={ref}
          type="checkbox"
          id={toggleId}
          checked={checked}
          onChange={onChange}
          disabled={isDisabled}
          className="sr-only peer"
          {...props}
        />
        <div className="w-11 h-6 bg-surface-700 peer-focus:ring-2 peer-focus:ring-primary-500/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 peer-disabled:opacity-50" />
      </div>

      {(label || description) && (
        <div>
          {label && <span className="text-sm font-medium text-surface-200 block">{label}</span>}
          {description && <span className="text-xs text-surface-400 block">{description}</span>}
        </div>
      )}
    </label>
  );
});

export default Toggle;
