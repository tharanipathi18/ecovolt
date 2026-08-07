import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@contexts/AuthContext';

/**
 * Standalone Admin Portal Login Page — EcoVolt Governance Portal.
 * Accessible only via /admin/login.
 */
export default function AdminLogin() {
  const { login, logout, clearError } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminError, setAdminError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    clearError();
    setAdminError(null);
    setIsSubmitting(true);

    try {
      const user = await login({ email: data.email, password: data.password });

      if (user.role !== 'admin') {
        await logout();
        setAdminError('403 Forbidden: Account does not have Administrator privileges.');
        return;
      }

      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setAdminError(err.message || 'Admin authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow Overlay */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/30 text-primary-400 flex items-center justify-center text-3xl mx-auto shadow-xl">
            🛡️
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            System Administration
          </h1>
          <p className="text-surface-400 text-xs md:text-sm">
            EcoVolt Governance Portal &amp; Management Interface
          </p>
        </div>

        <div className="mt-8 glass-card p-8 rounded-3xl border border-surface-700/80 shadow-2xl space-y-6">
          {adminError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{adminError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-2">
                Administrator Email
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'Admin email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' },
                })}
                placeholder="admin@ecovolt.com"
                className="w-full px-4 py-3 rounded-xl bg-surface-900 border border-surface-700 text-white placeholder-surface-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-surface-900 border border-surface-700 text-white placeholder-surface-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white text-xs"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating Administrator...</span>
                </>
              ) : (
                'Sign In to Admin Portal'
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-surface-700/50 text-center">
            <p className="text-[11px] text-surface-500">
              Authorized access only. All system actions are logged and audited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
