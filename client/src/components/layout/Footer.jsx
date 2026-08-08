/**
 * Footer component with status indicators, copyright, and documentation links.
 */
export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          <span className="font-medium text-slate-600">EcoVolt Platform v1.0.0 — All Systems Operational</span>
        </div>

        <div className="flex items-center gap-6">
          <a href="#privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
          <a href="#terms" className="hover:text-slate-900 transition-colors">Terms of Service</a>
          <a href="#docs" className="hover:text-slate-900 transition-colors">API Specs</a>
          <span>© {new Date().getFullYear()} EcoVolt Inc.</span>
        </div>
      </div>
    </footer>
  );
}

