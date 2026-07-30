import { useState, useEffect } from 'react';

/**
 * Reusable Notification / Toast / Alert banner component.
 *
 * Types: success | warning | error | info
 */
export default function Notification({
  type = 'info',
  title,
  message,
  onClose,
  autoClose = false,
  duration = 5000,
  className = '',
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  if (!isVisible) return null;

  const styleMap = {
    success: {
      border: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
      iconColor: 'text-emerald-400',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      ),
    },
    warning: {
      border: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
      iconColor: 'text-amber-400',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    },
    error: {
      border: 'border-red-500/30 bg-red-500/10 text-red-300',
      iconColor: 'text-red-400',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      ),
    },
    info: {
      border: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
      iconColor: 'text-blue-400',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    },
  };

  const currentStyle = styleMap[type];

  return (
    <div
      className={`p-4 rounded-xl border backdrop-blur-md flex items-start gap-3 transition-all animate-fade-in ${currentStyle.border} ${className}`}
    >
      <svg className={`w-5 h-5 mt-0.5 shrink-0 ${currentStyle.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {currentStyle.icon}
      </svg>

      <div className="flex-1 text-sm">
        {title && <h5 className="font-semibold text-white mb-0.5">{title}</h5>}
        {message && <p className="opacity-90">{message}</p>}
      </div>

      {onClose && (
        <button
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className="text-surface-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
