import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@contexts/AuthContext';
import authService from '@services/authService';
import { REGISTERABLE_ROLES } from '@utils/constants';

/**
 * Register page — premium dark glassmorphism design with role selection.
 *
 * Flow:
 *  1. Client-side validation via react-hook-form (name, email, password strength,
 *     confirm password match, role).
 *  2. On submit → POST /api/auth/register via authService → Axios → apiClient.
 *  3. Loading spinner shown during the API call.
 *  4. On success → green success banner displayed → redirect to /login after 2 s.
 *  5. On API error → red error banner shows the server's message (e.g. duplicate email).
 *  6. Per-field inline error messages from react-hook-form shown below each input.
 */
export default function Register() {
  const { loginWithGoogle, clearError } = useAuth();
  const navigate = useNavigate();

  // ── Local UI state ────────────────────────────────────────────────
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState('ev_user');
  const [apiError, setApiError] = useState(null);       // Server-returned error string
  const [successMessage, setSuccessMessage] = useState(null); // Success banner text

  // ── react-hook-form setup ─────────────────────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
    },
  });

  // Watch password value in real time for strength indicator + confirm validation
  const password = watch('password');

  // ── Form submit handler ───────────────────────────────────────────
  const onSubmit = async (data) => {
    // Reset both banners before every attempt
    setApiError(null);
    setSuccessMessage(null);
    clearError(); // also clear any stale AuthContext error

    setIsSubmitting(true);

    try {
      // Direct API call — we intentionally do NOT call AuthContext.register()
      // because that would auto-login the user. The requirement is to redirect
      // to /login after registration so the user logs in explicitly.
      await authService.register({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        confirmPassword: data.confirmPassword,
        phone: data.phone?.trim() || undefined,
        role: selectedRole,
      });

      // Show success banner
      setSuccessMessage('Account created successfully! Redirecting to login…');

      // Navigate to /login after 2 seconds so the user can read the message
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      // apiClient normalises all error shapes to { message, errors[] }
      // Show the primary server message (e.g. "An account with this email already exists")
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Password strength bar logic ───────────────────────────────────
  const strengthChecks = [
    password?.length >= 8,
    /[A-Z]/.test(password || ''),
    /[a-z]/.test(password || ''),
    /\d/.test(password || ''),
  ];
  const strengthScore = strengthChecks.filter(Boolean).length; // 0–4
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-primary-500'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-surface-900 relative overflow-hidden">

      {/* ── Ambient background blobs ────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-secondary-500/5 blur-[120px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-500/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-lg relative z-10 animate-fade-in">

        {/* ── Brand header ──────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-extrabold tracking-tight">
              <span className="gradient-text">Eco</span>
              <span className="text-white">Volt</span>
            </h1>
          </Link>
          <p className="mt-2 text-surface-400 text-sm">
            Join the renewable energy revolution
          </p>
        </div>

        {/* ── Card ──────────────────────────────────────────────────── */}
        <div className="glass-card p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">Create your account</h2>
            <p className="text-surface-400 text-sm mt-1">
              Get started with EcoVolt in minutes
            </p>
          </div>

          {/* ── Success banner ──────────────────────────────────────── */}
          {successMessage && (
            <div
              id="register-success-banner"
              role="status"
              className="mb-5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20
                         text-emerald-400 text-sm flex items-start gap-3 animate-fade-in"
            >
              {/* Checkmark icon */}
              <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          {/* ── API error banner ─────────────────────────────────────── */}
          {apiError && (
            <div
              id="register-error-banner"
              role="alert"
              className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20
                         text-red-400 text-sm flex items-start gap-3 animate-fade-in"
            >
              {/* Warning icon */}
              <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

            {/* ── Role selection ──────────────────────────────────── */}
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                I am a…
              </label>
              <div className="grid grid-cols-2 gap-2">
                {REGISTERABLE_ROLES.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    aria-pressed={selectedRole === role.value}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                      selectedRole === role.value
                        ? 'border-primary-500 bg-primary-950 ring-1 ring-primary-500/30'
                        : 'border-surface-700 bg-surface-800 hover:border-surface-600'
                    }`}
                  >
                    <p className={`text-sm font-medium ${
                      selectedRole === role.value ? 'text-primary-400' : 'text-surface-300'
                    }`}>
                      {role.label}
                    </p>
                    <p className="text-xs text-surface-500 mt-0.5">{role.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Full Name ───────────────────────────────────────── */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-surface-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  className={`w-full pl-11 pr-4 py-3 bg-surface-800 border rounded-xl text-white
                    placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50
                    focus:border-primary-500 transition-all ${
                    errors.name ? 'border-red-500/50' : 'border-surface-700'
                  }`}
                  {...register('name', {
                    required: 'Name is required',
                    maxLength: { value: 100, message: 'Name cannot exceed 100 characters' },
                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  })}
                />
              </div>
              {errors.name && (
                <p id="name-error" className="mt-1.5 text-sm text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* ── Email ──────────────────────────────────────────── */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-surface-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  className={`w-full pl-11 pr-4 py-3 bg-surface-800 border rounded-xl text-white
                    placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50
                    focus:border-primary-500 transition-all ${
                    errors.email ? 'border-red-500/50' : 'border-surface-700'
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
                <p id="email-error" className="mt-1.5 text-sm text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* ── Phone (optional) ────────────────────────────────── */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-surface-300 mb-1.5">
                Phone <span className="text-surface-600">(optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257
                         1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0
                         01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-11 pr-4 py-3 bg-surface-800 border border-surface-700 rounded-xl
                    text-white placeholder-surface-500 focus:outline-none focus:ring-2
                    focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  {...register('phone')}
                />
              </div>
            </div>

            {/* ── Password ─────────────────────────────────────────── */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-surface-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min 8 chars, uppercase, lowercase, number"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  className={`w-full pl-11 pr-12 py-3 bg-surface-800 border rounded-xl text-white
                    placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50
                    focus:border-primary-500 transition-all ${
                    errors.password ? 'border-red-500/50' : 'border-surface-700'
                  }`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                    validate: {
                      hasUpperCase: (v) => /[A-Z]/.test(v) || 'Must contain an uppercase letter',
                      hasLowerCase: (v) => /[a-z]/.test(v) || 'Must contain a lowercase letter',
                      hasNumber:    (v) => /\d/.test(v)    || 'Must contain a number',
                    },
                  })}
                />
                {/* Toggle password visibility */}
                <button
                  type="button"
                  id="toggle-password-visibility"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-surface-500
                    hover:text-surface-300 transition-colors"
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
                <p id="password-error" className="mt-1.5 text-sm text-red-400">
                  {errors.password.message}
                </p>
              )}

              {/* ── Password strength bar ────────────────────────── */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1.5">
                    {strengthChecks.map((met, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          met ? strengthColors[strengthScore - 1] : 'bg-surface-700'
                        }`}
                      />
                    ))}
                  </div>
                  {strengthScore > 0 && (
                    <p className={`text-xs mt-1 ${strengthColors[strengthScore - 1].replace('bg-', 'text-')}`}>
                      {strengthLabels[strengthScore - 1]}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ── Confirm Password ─────────────────────────────────── */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-surface-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0
                         01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332
                         9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
                  className={`w-full pl-11 pr-4 py-3 bg-surface-800 border rounded-xl text-white
                    placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50
                    focus:border-primary-500 transition-all ${
                    errors.confirmPassword ? 'border-red-500/50' : 'border-surface-700'
                  }`}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match',
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <p id="confirm-error" className="mt-1.5 text-sm text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* ── Submit button ─────────────────────────────────────── */}
            <button
              id="register-submit-btn"
              type="submit"
              disabled={isSubmitting || !!successMessage}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-primary-600 to-primary-500
                hover:from-primary-500 hover:to-primary-400 text-white font-semibold rounded-xl
                shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  {/* Spinner */}
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
                  Creating account…
                </>
              ) : successMessage ? (
                'Redirecting to login…'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* ── Social Login Divider & Google Button ───────────────── */}
          <div className="my-6 flex items-center justify-between gap-3">
            <div className="flex-1 h-px bg-surface-700/60" />
            <span className="text-xs text-surface-500 font-medium uppercase">Or continue with</span>
            <div className="flex-1 h-px bg-surface-700/60" />
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                const user = await loginWithGoogle();
                if (user) {
                  navigate('/dashboard', { replace: true });
                }
              } catch (err) {
                console.error('Google registration failed:', err);
              }
            }}
            className="w-full py-3 px-4 rounded-xl bg-surface-800 hover:bg-surface-700 border border-surface-700 text-white font-medium text-sm flex items-center justify-center gap-3 transition-all shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* ── Login link ──────────────────────────────────────────── */}
          <div className="mt-6 text-center">
            <p className="text-surface-400 text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────── */}
        <p className="mt-8 text-center text-surface-600 text-xs">
          © {new Date().getFullYear()} EcoVolt. All rights reserved.
        </p>
      </div>
    </div>
  );
}
