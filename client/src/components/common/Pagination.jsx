/**
 * Reusable Pagination Component.
 */
export default function Pagination({ currentPage = 1, totalPages = 5, onPageChange }) {
  return (
    <div className="flex items-center justify-between py-3 px-4 bg-surface-900/60 border border-surface-800 rounded-2xl text-xs text-surface-400">
      <span>
        Showing Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong>
      </span>
      <div className="flex items-center gap-2">
        <button
          disabled={currentPage <= 1}
          onClick={() => onPageChange && onPageChange(currentPage - 1)}
          className="px-3 py-1.5 rounded-xl border border-surface-700 bg-surface-800 text-surface-200 hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Previous
        </button>
        <button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange && onPageChange(currentPage + 1)}
          className="px-3 py-1.5 rounded-xl border border-surface-700 bg-surface-800 text-surface-200 hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
}
