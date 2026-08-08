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
    <div className={`w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {columns.map((col, idx) => (
              <th key={col.key || idx} className="px-6 py-3.5">
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm text-slate-700 font-normal">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, rIdx) => (
              <tr key={rIdx} className="animate-pulse">
                {columns.map((_, cIdx) => (
                  <td key={cIdx} className="px-6 py-4">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-400">
                <div className="flex flex-col items-center justify-center gap-2">
                  <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-sm font-medium">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rIdx) => (
              <tr
                key={row.id || row._id || rIdx}
                className="hover:bg-slate-50/70 transition-colors"
              >
                {columns.map((col, cIdx) => (
                  <td key={col.key || cIdx} className="px-6 py-3.5 whitespace-nowrap">
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

