import { useEffect } from 'react';

/**
 * Reusable Modal dialog component.
 *
 * Sizes: sm (max-w-md) | md (max-w-lg) | lg (max-w-2xl) | xl (max-w-4xl)
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  className = '',
}) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* Dialog container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full ${sizeClasses[size]} glass-card border border-white/10 p-6 md:p-8 shadow-2xl animate-slide-up ${className}`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4 pb-4 border-b border-surface-700/50">
            <div>
              {title && <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-surface-400 mt-1">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[70vh] overflow-y-auto pr-1">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="mt-6 pt-4 border-t border-surface-700/50 flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
