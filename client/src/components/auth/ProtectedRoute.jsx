import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';

/**
 * ProtectedRoute — wraps routes that require authentication.
 * Redirects to /login if not authenticated.
 * Optionally restricts by roles.
 *
 * @param {{ children: React.ReactNode, roles?: string[] }} props
 */
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Still loading auth state — show nothing (prevents flash)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-900">
        <div className="w-10 h-10 border-2 border-surface-600 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated — redirect to login with return URL
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check — if roles are specified and user's role isn't included
  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-900">
        <div className="glass-card p-12 text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-surface-400 mb-6">
            You don't have permission to access this page.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
}
