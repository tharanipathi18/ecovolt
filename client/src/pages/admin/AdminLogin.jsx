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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center text-3xl mx-auto shadow-2xs">
            🛡️
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            System Administration
          </h1>
          <p className="text-slate-500 text-xs md:text-sm">
            EcoVolt Governance Portal &amp; Management Interface
          </p>
        </div>

        <div className="mt-8 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          {adminError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{adminError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Administrator Email
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'Admin email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' },
                })}
                placeholder="admin@ecovolt.com"
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-medium"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
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

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Authorized access only. All system actions are logged and audited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

