import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import authService from '@services/authService';

/**
 * Forgot Password page — request password reset via email.
 */
export default function ForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: '' },
  });

  const onSubmit = async (data) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(data);
      setIsSuccess(true);
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-surface-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[30%] w-[400px] h-[400px] rounded-full bg-accent-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[20%] w-[400px] h-[400px] rounded-full bg-primary-500/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-extrabold tracking-tight">
              <span className="gradient-text">Eco</span>
              <span className="text-white">Volt</span>
            </h1>
          </Link>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          {!isSuccess ? (
            <>
              {/* Header */}
              <div className="mb-6 text-center">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-accent-500/10 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Forgot your password?</h2>
                <p className="text-surface-400 text-sm mt-2">
                  Enter the email address associated with your account and we'll send you a link to reset your password.
                </p>
              </div>

              {/* Server Error */}
              {serverError && (
                <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{serverError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-surface-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className={`w-full pl-11 pr-4 py-3 bg-surface-800 border rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all ${
                        errors.email ? 'border-red-500/50' : 'border-surface-700'
                      }`}
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^\S+@\S+\.\S+$/,
                          message: 'Please enter a valid email',
                        },
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-sm text-red-400">{errors.email.message}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white font-semibold rounded-xl shadow-lg shadow-accent-500/20 hover:shadow-accent-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-4">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center mb-5">
                <svg className="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-surface-400 text-sm mb-6 leading-relaxed">
                We've sent password reset instructions to your email address. 
                The link will expire in 15 minutes.
              </p>
              <p className="text-surface-500 text-xs mb-6">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => { setIsSuccess(false); setServerError(''); }}
                  className="text-primary-400 hover:text-primary-300 underline transition-colors"
                >
                  try again
                </button>
              </p>
            </div>
          )}

          {/* Back to login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-surface-400 hover:text-surface-300 text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to sign in
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-surface-600 text-xs">
          © {new Date().getFullYear()} EcoVolt. All rights reserved.
        </p>
      </div>
    </div>
  );
}
