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
  const { clearError } = useAuth();
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
  const strengthColors = ['bg-rose-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-600'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-8 relative overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-sky-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10 animate-fade-in">
        {/* Left Column: Sustainability Brand & Illustration */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Decorative Energy Shapes */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-xl flex items-center justify-center shadow-inner">
                ⚡
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                Eco<span className="text-emerald-300">Volt</span>
              </span>
            </Link>

            <div className="mt-12 space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold backdrop-blur-xs border border-white/10">
                🌱 Clean Mobility Infrastructure
              </span>
              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                Power a cleaner journey.
              </h2>
              <p className="text-emerald-100/80 text-sm leading-relaxed">
                Connect your EV, discover clean charging, and manage your electric mobility in one ecosystem.
              </p>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="mt-12 pt-8 border-t border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-700/50 flex items-center justify-center text-sm text-emerald-200">
                🔌
              </div>
              <div>
                <p className="text-xs font-bold text-white">100% Real Charging Ports</p>
                <p className="text-[11px] text-emerald-200/70">Verified, active stations across the grid</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-700/50 flex items-center justify-center text-sm text-emerald-200">
                ☀️
              </div>
              <div>
                <p className="text-xs font-bold text-white">Solar &amp; Wind Coordination</p>
                <p className="text-[11px] text-emerald-200/70">Charge during peak renewable production</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-[11px] text-emerald-200/60">
            © {new Date().getFullYear()} EcoVolt. All rights reserved.
          </div>
        </div>

        {/* Right Column: Registration Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create your account</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Select your role and enter your details to join EcoVolt
            </p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div
              id="register-success-banner"
              role="status"
              className="mb-5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-start gap-3 animate-fade-in"
            >
              <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          {/* API Error Banner */}
          {apiError && (
            <div
              id="register-error-banner"
              role="alert"
              className="mb-5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-3 animate-fade-in"
            >
              <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Role selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                I am registering as…
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
                        ? 'border-emerald-700 bg-emerald-50 ring-1 ring-emerald-700/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <p className={`text-xs font-bold ${
                      selectedRole === role.value ? 'text-emerald-900' : 'text-slate-700'
                    }`}>
                      {role.label}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{role.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                aria-invalid={!!errors.name}
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all ${
                  errors.name ? 'border-rose-400' : 'border-slate-200'
                }`}
                {...register('name', { required: 'Full Name is required' })}
              />
              {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all ${
                  errors.email ? 'border-rose-400' : 'border-slate-200'
                }`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
                })}
              />
              {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
            </div>

            {/* Passwords grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Min 8 characters"
                    className={`w-full px-4 py-2.5 pr-10 bg-white border rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all ${
                      errors.password ? 'border-rose-400' : 'border-slate-200'
                    }`}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 8, message: 'At least 8 chars required' },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-medium"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {password && (
                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Strength:</span>
                    <span className="font-semibold text-slate-700">{strengthLabels[strengthScore - 1] || 'Weak'}</span>
                  </div>
                )}
                {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                  className={`w-full px-4 py-2.5 bg-white border rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all ${
                    errors.confirmPassword ? 'border-rose-400' : 'border-slate-200'
                  }`}
                  {...register('confirmPassword', {
                    required: 'Please confirm password',
                    validate: (value) => value === password || 'Passwords do not match',
                  })}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-rose-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="register-submit-btn"
              type="submit"
              disabled={isSubmitting || !!successMessage}
              className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account…</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>



          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-800 hover:text-emerald-900 font-bold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
