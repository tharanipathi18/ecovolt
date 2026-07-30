import { Link } from 'react-router-dom';

/**
 * 404 Not Found page.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-900 px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[30%] left-[40%] w-[300px] h-[300px] rounded-full bg-red-500/5 blur-[120px]" />
      </div>

      <div className="text-center relative z-10 animate-fade-in">
        <h1 className="text-8xl font-extrabold gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-3">Page Not Found</h2>
        <p className="text-surface-400 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/"
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-medium rounded-xl shadow-lg shadow-primary-500/20 transition-all duration-300"
          >
            Go Home
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 bg-surface-800 hover:bg-surface-700 border border-surface-600 text-surface-300 hover:text-white rounded-xl font-medium transition-all duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
