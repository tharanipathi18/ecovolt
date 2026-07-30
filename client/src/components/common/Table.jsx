/**
 * Reusable Data Table component for displaying structured data.
 *
 * Props:
 * - columns: [{ key: 'name', title: 'Name', render?: (row) => JSX }]
 * - data: Array of data objects
 * - isLoading: boolean
 * - emptyMessage: string
 */
export default function Table({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = 'No data available',
  className = '',
}) {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-surface-700/60 bg-surface-900/50 ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-surface-700/80 bg-surface-800/60 text-xs font-semibold uppercase tracking-wider text-surface-400">
            {columns.map((col, idx) => (
              <th key={col.key || idx} className="px-6 py-4">
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-800 text-sm text-surface-200">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, rIdx) => (
              <tr key={rIdx} className="animate-pulse">
                {columns.map((_, cIdx) => (
                  <td key={cIdx} className="px-6 py-4">
                    <div className="h-4 bg-surface-800 rounded w-3/4" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-surface-500">
                <div className="flex flex-col items-center justify-center gap-2">
                  <svg className="w-8 h-8 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p>{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rIdx) => (
              <tr
                key={row.id || row._id || rIdx}
                className="hover:bg-surface-800/40 transition-colors"
              >
                {columns.map((col, cIdx) => (
                  <td key={col.key || cIdx} className="px-6 py-4 whitespace-nowrap">
                    {col.render ? col.render(row, rIdx) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
