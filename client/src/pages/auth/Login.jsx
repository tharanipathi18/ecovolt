import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth, ROLE_DASHBOARD_MAP } from '@contexts/AuthContext';

/**
 * Login page — premium dark glassmorphism design.
 *
 * Flow:
 *  1. Client-side validation via react-hook-form (email format, password required).
 *  2. On submit → AuthContext.login() → POST /api/auth/login via apiClient.
 *  3. On success:
 *       a. AuthContext saves JWT to sessionStorage ('ecovolt_token')
 *       b. AuthContext saves user object to global state (isAuthenticated = true)
 *       c. Login.jsx redirects to: `from` (if redirected here by ProtectedRoute)
 *          OR the role-specific dashboard (admin→/admin, ev_user→/dashboard, etc.)
 *  4. On failure → authError string set in AuthContext → red error banner rendered.
 *  5. Loading spinner shown during the API round-trip; button disabled to prevent
 *     double-submit.
 */
export default function Login() {
  const { login, error: authError, clearError } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If the user was redirected to /login by ProtectedRoute, send them back
  // to where they came from after a successful login.
  const from = location.state?.from?.pathname;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    clearError();           // Clear any stale error from a previous attempt
    setIsSubmitting(true);

    try {
      // AuthContext.login():
      //   1. POST /api/auth/login with { email, password }
      //   2. Saves JWT to sessionStorage as 'ecovolt_token'
      //   3. Sets token + user in global state → isAuthenticated = true
      //   4. Returns user object for redirect decision below
      const user = await login({ email: data.email, password: data.password });

      // Redirect to the original destination (if redirected here by ProtectedRoute),
      // or to the role-specific dashboard, or fallback to /dashboard.
      const redirectTo = from || ROLE_DASHBOARD_MAP[user.role] || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch {
      // AuthContext.login() already set authError in context.
      // We only need to stop the spinner here.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* ── Brand header ────────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              <span className="gradient-text">Eco</span>
              <span>Volt</span>
            </h1>
          </Link>
          <p className="mt-2 text-slate-500 text-sm">
            Smart Energy &amp; EV Management Platform
          </p>
        </div>

        {/* ── Card ────────────────────────────────────────────────────── */}
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-1">
              Sign in to your account to continue
            </p>
          </div>

          {/* ── API / Auth error banner ──────────────────────────────── */}
          {authError && (
            <div
              id="login-error-banner"
              role="alert"
              className="mb-5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200
                         text-rose-700 text-sm flex items-start gap-3 animate-fade-in"
            >
              <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{authError}</span>
            </div>
          )}

          <form id="login-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* ── Email ──────────────────────────────────────────────── */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className={`w-full pl-11 pr-4 py-3 bg-white border rounded-xl text-slate-900
                    placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20
                    focus:border-emerald-700 transition-all ${
                    errors.email ? 'border-rose-400' : 'border-slate-200'
                  }`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email address',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="mt-1.5 text-xs text-rose-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* ── Password ─────────────────────────────────────────────── */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-emerald-800 hover:text-emerald-900 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  className={`w-full pl-11 pr-12 py-3 bg-white border rounded-xl text-slate-900
                    placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20
                    focus:border-emerald-700 transition-all ${
                    errors.password ? 'border-rose-400' : 'border-slate-200'
                  }`}
                  {...register('password', {
                    required: 'Password is required',
                  })}
                />
                {/* Toggle password visibility */}
                <button
                  type="button"
                  id="toggle-password-visibility"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400
                    hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0
                           011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88
                           9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112
                           5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274
                           4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="mt-1.5 text-xs text-rose-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* ── Submit button ─────────────────────────────────────────── */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl
                shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2 text-sm"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="w-5 h-5 animate-spin text-white/70"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12" cy="12" r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>



          {/* ── Register link ────────────────────────────────────────── */}
          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="text-emerald-800 hover:text-emerald-900 font-bold transition-colors"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <p className="mt-8 text-center text-slate-400 text-xs">
          © {new Date().getFullYear()} EcoVolt. All rights reserved.
        </p>
      </div>
    </div>
  );
}

