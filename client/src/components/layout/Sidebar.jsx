import { NavLink } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';

/**
 * Modern Sidebar component for standard platform user interfaces.
 * Strictly free of public Admin links (Admin Portal is accessible only via hidden /admin URL).
 */
export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const userRole = user?.role || 'ev_user';

  const defaultRoleItems = [
    { name: 'Overview', path: '/dashboard', icon: '📊' },
    { name: 'EV Charging Ports', path: '/charging', icon: '⚡' },
    { name: 'Renewable Energy', path: '/energy', icon: '🌱' },
    { name: 'My Profile', path: '/profile', icon: '👤' },
    { name: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  const roleNavMap = {
    ev_user: [
      { name: 'Overview', path: '/dashboard', icon: '📊' },
      { name: 'Charging Ports', path: '/charging', icon: '⚡' },
      { name: 'My Profile', path: '/profile', icon: '👤' },
      { name: 'Settings', path: '/settings', icon: '⚙️' },
    ],
    fleet_manager: [
      { name: 'Overview', path: '/fleet', icon: '📊' },
      { name: 'Fleet Vehicles & Drivers', path: '/fleet?tab=fleet', icon: '🚚' },
      { name: 'Fleet Charging', path: '/fleet?tab=charging', icon: '⚡' },
      { name: 'Maintenance & Operations', path: '/fleet?tab=maintenance', icon: '🔧' },
      { name: 'Fleet Analytics', path: '/fleet?tab=analytics', icon: '📈' },
      { name: 'My Profile', path: '/profile', icon: '👤' },
      { name: 'Settings', path: '/settings', icon: '⚙️' },
    ],
    ev_port: [
      { name: 'Station Hub', path: '/charging', icon: '⚡' },
      { name: 'My Profile', path: '/profile', icon: '👤' },
      { name: 'Settings', path: '/settings', icon: '⚙️' },
    ],
    generator: [
      { name: 'Renewable Power', path: '/energy', icon: '🌱' },
      { name: 'My Profile', path: '/profile', icon: '👤' },
      { name: 'Settings', path: '/settings', icon: '⚙️' },
    ],
    admin: [
      { name: 'Overview', path: '/dashboard', icon: '📊' },
      { name: 'Charging Ports', path: '/charging', icon: '⚡' },
      { name: 'Generators', path: '/energy', icon: '🌱' },
      { name: 'Fleet Management', path: '/fleet', icon: '🚚' },
      { name: 'My Profile', path: '/profile', icon: '👤' },
      { name: 'Settings', path: '/settings', icon: '⚙️' },
    ],
  };

  const visibleNavItems = roleNavMap[userRole] || defaultRoleItems;

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden animate-fade-in"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
            <NavLink to="/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-800 flex items-center justify-center text-white font-black text-lg shadow-sm">
                ⚡
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight leading-none">
                  <span className="gradient-text">Eco</span>
                  <span className="text-slate-900">Volt</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-0.5">
                  AI Energy Grid
                </p>
              </div>
            </NavLink>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 md:hidden"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Navigation Menu
            </p>
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200/80 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Card: Grid Status Widget */}
        <div className="p-4 border-t border-slate-100">
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-900">Local Microgrid</span>
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mb-2 overflow-hidden">
              <div className="bg-emerald-700 h-full w-[84%]" />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Renewable Ratio</span>
              <span className="text-emerald-800 font-semibold">84% Clean</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

