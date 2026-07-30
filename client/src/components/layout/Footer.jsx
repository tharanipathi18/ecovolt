/**
 * Footer component with status indicators, copyright, and documentation links.
 */
export default function Footer() {
  return (
    <footer className="border-t border-surface-800 bg-surface-900/50 py-4 px-6 text-xs text-surface-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(0,230,92,0.6)]" />
          <span>EcoVolt Platform v1.0.0 — All Systems Operational</span>
        </div>

        <div className="flex items-center gap-6">
          <a href="#privacy" className="hover:text-surface-300 transition-colors">Privacy Policy</a>
          <a href="#terms" className="hover:text-surface-300 transition-colors">Terms of Service</a>
          <a href="#docs" className="hover:text-surface-300 transition-colors">API Specs</a>
          <span>© {new Date().getFullYear()} EcoVolt Inc.</span>
        </div>
      </div>
    </footer>
  );
}
