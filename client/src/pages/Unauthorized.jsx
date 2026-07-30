import { Link } from 'react-router-dom';
import { Button } from '@components/common';

/**
 * 403 Unauthorized Access Page.
 */
export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-6 text-center animate-fade-in">
      <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-red-500/30 shadow-2xl space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center text-4xl shadow-lg">
          🔒
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">403 Access Denied</h1>
          <p className="text-surface-400 text-sm">
            You do not have permission to access this page or dashboard with your current account role.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <Link to="/login">
            <Button variant="primary" fullWidth>
              Return to Login
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" fullWidth>
              Back to Home Page
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
