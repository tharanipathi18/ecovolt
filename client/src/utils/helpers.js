/**
 * Common utility / helper functions used across the application.
 */

/**
 * Format a date string into a human-readable format.
 * @param {string|Date} date
 * @param {Intl.DateTimeFormatOptions} options
 * @returns {string}
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(new Date(date));
}

/**
 * Format a number as currency.
 * @param {number} amount
 * @param {string} currency
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format energy values with appropriate units.
 * @param {number} value - Value in kWh
 * @returns {string}
 */
export function formatEnergy(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)} GWh`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)} MWh`;
  return `${value.toFixed(2)} kWh`;
}

/**
 * Format power values with appropriate units.
 * @param {number} value - Value in kW
 * @returns {string}
 */
export function formatPower(value) {
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)} MW`;
  return `${value.toFixed(2)} kW`;
}

/**
 * Truncate a string to a given length with ellipsis.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(str, maxLength = 50) {
  if (!str || str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}…`;
}

/**
 * Debounce a function call.
 * @param {Function} fn
 * @param {number} delay - Delay in ms
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Generate a random color from a predefined palette.
 * Useful for charts and visual elements.
 * @param {number} index
 * @returns {string}
 */
export function getChartColor(index) {
  const palette = [
    '#00e65c', '#3b82f6', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
    '#f97316', '#6366f1',
  ];
  return palette[index % palette.length];
}

/**
 * Classname merger — combines class strings, filtering out falsy values.
 * @param  {...string} classes
 * @returns {string}
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Sleep utility for async operations.
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get initials from a full name (for avatars).
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  if (!name) return '??';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
