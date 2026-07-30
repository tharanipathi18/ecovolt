import { forwardRef } from 'react';

/**
 * Reusable Checkbox component.
 */
const Checkbox = forwardRef(function Checkbox(
  {
    label,
    checked = false,
    onChange,
    isDisabled = false,
    className = '',
    id,
    ...props
  },
  ref,
) {
  const checkboxId = id || props.name;

  return (
    <label htmlFor={checkboxId} className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${className}`}>
      <input
        ref={ref}
        type="checkbox"
        id={checkboxId}
        checked={checked}
        onChange={onChange}
        disabled={isDisabled}
        className="w-4 h-4 rounded bg-surface-800 border-surface-600 text-primary-500 focus:ring-primary-500/40 focus:ring-offset-surface-900 cursor-pointer disabled:opacity-50"
        {...props}
      />
      {label && <span className="text-sm text-surface-300">{label}</span>}
    </label>
  );
});

export default Checkbox;
