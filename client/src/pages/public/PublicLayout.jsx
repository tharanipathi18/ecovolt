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
    <div className="min-h-screen bg-surface-900 text-surface-100 flex flex-col font-sans selection:bg-primary-500 selection:text-surface-950">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 bg-surface-900/80 backdrop-blur-xl border-b border-surface-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-500 to-secondary-500 flex items-center justify-center text-surface-950 font-black text-xl shadow-lg shadow-primary-500/20">
              ⚡
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight">
                <span className="gradient-text">Eco</span>
                <span className="text-white">Volt</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] text-surface-400 font-medium tracking-wider uppercase ml-2 bg-surface-800 px-2 py-0.5 rounded-full border border-surface-700">
                AI Energy Grid
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-surface-800/40 p-1.5 rounded-full border border-surface-700/50">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-500 text-surface-950 font-semibold shadow-md shadow-primary-500/20'
                      : 'text-surface-300 hover:text-white hover:bg-surface-800'
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
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold text-sm shadow-lg shadow-primary-500/20 transition-all"
              >
                Go to Dashboard ({user?.role?.replace('_', ' ')})
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-surface-300 hover:text-white hover:bg-surface-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-semibold text-sm shadow-lg shadow-primary-500/20 transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800 md:hidden"
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
          <div className="md:hidden border-b border-surface-800 bg-surface-900/95 backdrop-blur-xl px-4 py-4 space-y-2 animate-slide-down">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary-500/10 text-primary-400 font-semibold' : 'text-surface-300 hover:bg-surface-800'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            <div className="pt-3 border-t border-surface-800 flex flex-col gap-2">
              {isAuthenticated ? (
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-primary-600 text-white font-semibold text-sm"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl border border-surface-700 text-surface-200 text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl bg-primary-600 text-white font-semibold text-sm"
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
      <footer className="border-t border-surface-800 bg-surface-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-xl font-extrabold">
                <span className="gradient-text">Eco</span>
                <span className="text-white">Volt</span>
              </span>
            </Link>
            <p className="text-xs text-surface-400 leading-relaxed">
              AI-powered decentralized renewable energy coordination & smart EV management platform.
              Connecting green power to EV demand seamlessly.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Platform</h4>
            <ul className="space-y-2 text-xs text-surface-400">
              <li><Link to="/features" className="hover:text-primary-400 transition-colors">Solar & Wind Sync</Link></li>
              <li><Link to="/features" className="hover:text-primary-400 transition-colors">EV Charging Demand AI</Link></li>
              <li><Link to="/features" className="hover:text-primary-400 transition-colors">Fleet Scheduling</Link></li>
              <li><Link to="/features" className="hover:text-primary-400 transition-colors">Microgrid Optimization</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Company</h4>
            <ul className="space-y-2 text-xs text-surface-400">
              <li><Link to="/about" className="hover:text-primary-400 transition-colors">About EcoVolt</Link></li>
              <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Contact Us</Link></li>
              <li><a href="#careers" className="hover:text-primary-400 transition-colors">Careers</a></li>
              <li><a href="#news" className="hover:text-primary-400 transition-colors">Press & Media</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">System Status</h4>
            <div className="p-3 rounded-xl bg-surface-900 border border-surface-800">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>All Microgrids Operational</span>
              </div>
              <p className="text-[11px] text-surface-500">84% Clean Energy Dispatch Ratio</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-surface-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-surface-500">
          <p>© {new Date().getFullYear()} EcoVolt Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:text-surface-300">Privacy Policy</a>
            <a href="#terms" className="hover:text-surface-300">Terms of Service</a>
            <a href="#security" className="hover:text-surface-300">Security Specs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
