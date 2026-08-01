import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';

/**
 * Dedicated Admin Portal Layout — Completely isolated management interface.
 * Contains Admin Header, Admin Sidebar with 10 dedicated management sections, and main outlet.
 */
export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleAdminLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/admin/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/station-requests', label: 'Station Requests', icon: '📋' },
    { path: '/admin/approved-stations', label: 'Approved Stations', icon: '🔌' },
    { path: '/admin/vehicles', label: 'Vehicles', icon: '🚗' },
    { path: '/admin/bookings', label: 'Bookings', icon: '🗓️' },
    { path: '/admin/sessions', label: 'Charging Sessions', icon: '⚡' },
    { path: '/admin/reports', label: 'Reports & Analytics', icon: '📈' },
    { path: '/admin/notifications', label: 'Notifications', icon: '🔔' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col text-surface-100 font-sans antialiased selection:bg-primary-500/30">
      {/* ── Top Header ────────────────────────────────────────────────── */}
      <header className="h-16 bg-surface-900/90 border-b border-surface-800/80 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-500/10 border border-primary-500/30 text-primary-400 flex items-center justify-center font-bold text-lg shadow-md">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white tracking-tight text-base">EcoVolt Governance Portal</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase">
                Supabase DB Live
              </span>
            </div>
            <p className="text-[11px] text-surface-400 hidden sm:block">
              Administrator Access • Logged in as <span className="text-white font-medium">{user?.name || 'Admin'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAdminLogout}
            disabled={isLoggingOut}
            className="px-4 py-2 bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white rounded-xl text-xs font-semibold border border-surface-700 transition-all flex items-center gap-2"
          >
            {isLoggingOut ? 'Signing Out...' : 'Sign Out Admin'}
          </button>
        </div>
      </header>

      {/* ── Main Layout Body ──────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 bg-surface-900/60 border-r border-surface-800/80 p-4 hidden md:flex flex-col justify-between shrink-0">
          <div className="space-y-1">
            <p className="px-3 py-2 text-[10px] font-bold text-surface-500 uppercase tracking-wider">
              Management Portal
            </p>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/admin/dashboard' && location.pathname === '/admin');
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-primary-500/10 text-primary-400 border border-primary-500/30 shadow-sm'
                      : 'text-surface-400 hover:text-white hover:bg-surface-800/60'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-3 rounded-2xl bg-surface-800/40 border border-surface-800 text-[11px] text-surface-400 space-y-1">
            <p className="font-bold text-white">Security Policy</p>
            <p className="text-[10px] leading-relaxed">
              This URL `/admin` is restricted. Unauthenticated or non-admin attempts are blocked.
            </p>
          </div>
        </aside>

        {/* Center Content Outlet */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
