import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';

/**
 * Public Layout wrapper with top header navigation, call-to-action buttons, and footer.
 */
export default function PublicLayout() {
  const { isAuthenticated, user, getDashboardPath } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Features', path: '/features' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-800 selection:text-white">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-white font-black text-xl shadow-2xs">
              ⚡
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight">
                <span className="gradient-text">Eco</span>
                <span className="text-slate-900">Volt</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] text-slate-500 font-semibold tracking-wider uppercase ml-2 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                AI Energy Grid
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-800 text-white font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={getDashboardPath()}
                className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-sm shadow-sm transition-all"
              >
                Go to Dashboard ({user?.role?.replace('_', ' ')})
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-sm shadow-sm transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 md:hidden"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-2 animate-slide-down">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200' : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {isAuthenticated ? (
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-emerald-800 text-white font-semibold text-sm"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl bg-emerald-800 text-white font-semibold text-sm"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Public Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Public Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-xl font-extrabold">
                <span className="gradient-text">Eco</span>
                <span className="text-slate-900">Volt</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              AI-powered decentralized renewable energy coordination & smart EV management platform.
              Connecting green power to EV demand seamlessly.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link to="/features" className="hover:text-emerald-800 transition-colors">Solar & Wind Sync</Link></li>
              <li><Link to="/features" className="hover:text-emerald-800 transition-colors">EV Charging Demand AI</Link></li>
              <li><Link to="/features" className="hover:text-emerald-800 transition-colors">Fleet Scheduling</Link></li>
              <li><Link to="/features" className="hover:text-emerald-800 transition-colors">Microgrid Optimization</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3">Company</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><Link to="/about" className="hover:text-emerald-800 transition-colors">About EcoVolt</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-800 transition-colors">Contact Us</Link></li>
              <li><a href="#careers" className="hover:text-emerald-800 transition-colors">Careers</a></li>
              <li><a href="#news" className="hover:text-emerald-800 transition-colors">Press & Media</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3">System Status</h4>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>All Microgrids Operational</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">84% Clean Energy Dispatch Ratio</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} EcoVolt Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:text-slate-900">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-900">Terms of Service</a>
            <a href="#security" className="hover:text-slate-900">Security Specs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

