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
    // If non-admin attempts to access an admin route, redirect to standard dashboard
    if (isAdminRoute) {
      return <Navigate to="/dashboard" replace />;
    }
    // Redirect to user's designated role home page
    const roleHomeMap = {
      admin: '/admin',
      generator: '/energy',
      ev_port: '/charging',
      ev_user: '/dashboard',
      fleet_manager: '/fleet',
    };
    return <Navigate to={roleHomeMap[user?.role] || '/dashboard'} replace />;
  }

  return children;
}
