import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';

/**
 * ProtectedRoute — wraps routes that require authentication and optional role authorization.
 * If accessing /admin and unauthenticated, redirects to /admin/login.
 * If user does not have required roles, renders 403 Forbidden page.
 *
 * @param {{ children: React.ReactNode, roles?: string[] }} props
 */
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  // Loading auth state — render spinner (prevents UI flash)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-900">
        <div className="w-10 h-10 border-2 border-surface-600 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated — redirect to /admin/login for admin routes, or /login for standard routes
  if (!isAuthenticated) {
    const loginRedirect = isAdminRoute ? '/admin/login' : '/login';
    return <Navigate to={loginRedirect} state={{ from: location }} replace />;
  }

  // Role check — if roles are specified and user's role isn't included
  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950 p-4">
        <div className="glass-card p-10 text-center max-w-md rounded-3xl border border-red-500/30 shadow-2xl space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center text-4xl mx-auto shadow-lg">
            🚫
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">403 Forbidden</h1>
          <p className="text-surface-400 text-sm">
            Access Denied. You do not have Administrator privileges to access the EcoVolt Governance Portal.
          </p>
          <div className="pt-2 flex flex-col gap-3">
            <Link
              to="/dashboard"
              className="w-full py-3 px-4 bg-surface-800 hover:bg-surface-700 text-white rounded-xl font-medium text-sm transition-colors border border-surface-700"
            >
              Return to User Dashboard
            </Link>
            <Link
              to="/admin/login"
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium text-sm transition-colors shadow-lg shadow-primary-500/20"
            >
              Sign In as Administrator
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
