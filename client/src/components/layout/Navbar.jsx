import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { ROLE_LABELS } from '@utils/constants';

/**
 * Modern Navbar component with EcoVolt logo, search input, notification
 * center, and user avatar dropdown.
 *
 * Logout flow:
 *  1. User clicks "Sign Out" → handleLogout() runs
 *  2. Spinner shown in the button, button disabled (prevents double-click)
 *  3. AuthContext.logout() fires:
 *       a. POST /api/auth/logout → clears server-side HttpOnly cookie
 *       b. finally block → setUser(null), setToken(null), setError(null),
 *          localStorage.removeItem('ecovolt_token')
 *  4. navigate('/login', { replace: true }) — client navigates to login page
 *     (replace: true removes the dashboard from history so Back doesn't return)
 */
export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu]   = useState(false);
  const [isLoggingOut, setIsLoggingOut]   = useState(false);

  // ── Logout handler ────────────────────────────────────────────────
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // AuthContext clears: user, token, error, localStorage token
      await logout();
      // Explicit redirect — replaces history so Back button won't go back
      navigate('/login', { replace: true });
    } finally {
      // Safety net: reset spinner in case navigate fails (should never happen)
      setIsLoggingOut(false);
    }
  };

  // ── Sample system notifications ───────────────────────────────────
  const notifications = [
    { id: 1, title: 'Solar Array Alpha', text: 'Peak generation reached (450 kW)', time: '5m ago', unread: true },
    { id: 2, title: 'Grid Coordination', text: 'Demand forecast synced with AI model', time: '20m ago', unread: true },
    { id: 3, title: 'Charging Port #4', text: 'Session completed — 48 kWh delivered', time: '1h ago', unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-surface-900/80 backdrop-blur-xl border-b border-surface-800/80 px-4 md:px-6 flex items-center justify-between gap-4">

      {/* ── Left: Mobile Menu Toggle & Breadcrumb ───────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800 transition-colors md:hidden"
          aria-label="Toggle Navigation Sidebar"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Brand / Logo for mobile */}
        <Link to="/dashboard" className="md:hidden flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight">
            <span className="gradient-text">Eco</span>
            <span className="text-white">Volt</span>
          </span>
        </Link>

        {/* Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-sm text-surface-400">
          <span className="text-surface-600">Platform</span>
          <span>/</span>
          <span className="text-white font-medium capitalize">
            {location.pathname.replace('/', '') || 'Dashboard'}
          </span>
        </div>
      </div>

      {/* ── Middle: Search Bar ──────────────────────────────────────── */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search stations, fleets, or energy generators... (Ctrl + K)"
            className="w-full pl-10 pr-4 py-2 bg-surface-800/60 border border-surface-700/60 rounded-xl text-xs text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
          />
        </div>
      </div>

      {/* ── Right: Sync Badge, Notifications, User Menu ─────────────── */}
      <div className="flex items-center gap-3">

        {/* Real-time sync badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Grid Sync Active</span>
        </div>

        {/* ── Notifications Popover ──────────────────────────────────── */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="p-2 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800 transition-colors relative"
            aria-label="View notifications"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(0,230,92,0.8)]" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-card p-4 shadow-2xl border border-surface-700 animate-slide-down z-50">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-700/50">
                <h4 className="font-semibold text-white text-sm">System Notifications</h4>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 font-medium">
                  {unreadCount} new
                </span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl border text-xs transition-colors ${
                      n.unread
                        ? 'bg-primary-500/5 border-primary-500/20 text-surface-200'
                        : 'bg-surface-800/40 border-surface-700/40 text-surface-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-white">{n.title}</span>
                      <span className="text-[10px] text-surface-500">{n.time}</span>
                    </div>
                    <p>{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── User Menu Dropdown ─────────────────────────────────────── */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-surface-800 transition-colors border border-transparent hover:border-surface-700"
            aria-label="Open user menu"
          >
            {/* Avatar initials */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-secondary-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'EV'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">{user?.name || 'User Account'}</p>
              <p className="text-[10px] text-primary-400 font-medium leading-tight">
                {ROLE_LABELS[user?.role] || 'User'}
              </p>
            </div>
            <svg className="w-4 h-4 text-surface-400 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 glass-card p-2 shadow-2xl border border-surface-700 animate-slide-down z-50">

              {/* User Info Header */}
              <div className="px-3 py-2 border-b border-surface-700/50 mb-1">
                <p className="text-xs font-bold text-white">{user?.name}</p>
                <p className="text-[11px] text-surface-400 truncate">{user?.email}</p>
              </div>

              {/* Profile Link */}
              <div className="py-1">
                <Link
                  to="/dashboard"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-surface-300 hover:text-white hover:bg-surface-800 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile &amp; Settings
                </Link>
              </div>

              {/* Sign Out */}
              <div className="border-t border-surface-700/50 pt-1 mt-1">
                <button
                  id="logout-btn"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400
                    hover:bg-red-500/10 rounded-lg transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <>
                      {/* Inline spinner */}
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Signing out…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
