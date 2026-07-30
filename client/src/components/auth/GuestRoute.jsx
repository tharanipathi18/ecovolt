import { Navigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';

/**
 * GuestRoute — wraps routes that should only be accessible to unauthenticated users.
 * Redirects authenticated users to their role-based dashboard.
 *
 * @param {{ children: React.ReactNode }} props
 */
export default function GuestRoute({ children }) {
  const { isAuthenticated, loading, getDashboardPath } = useAuth();

  // Still loading auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-900">
        <div className="w-10 h-10 border-2 border-surface-600 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Already authenticated — redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to={getDashboardPath()} replace />;
  }

  return children;
}
