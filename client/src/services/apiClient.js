import axios from 'axios';

/**
 * Pre-configured Axios instance for EcoVolt API calls.
 *
 * Features:
 * - Base URL from environment variables
 * - Automatic JWT token injection via request interceptor
 * - Centralized error normalization via response interceptor
 * - Smart 401 handling — only redirects to /login for protected routes,
 *   NOT for auth routes (login/register) where 401 means "wrong credentials"
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Attaches the stored JWT as a Bearer token to every outgoing request.
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('ecovolt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Auth routes that intentionally return 401 for wrong credentials.
// We must NOT redirect to /login when these URLs receive a 401.
const AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/forgot-password'];
const isAuthRoute = (url = '') => AUTH_ROUTES.some((route) => url.includes(route));

// ─── Response Interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  // ✅ Success: unwrap Axios envelope — resolves with the raw API JSON body
  // e.g. { success: true, message: "...", data: { user, token } }
  (response) => response.data,

  // ❌ Error: normalize all error shapes into { status, message, errors[] }
  (error) => {
    const { response, config } = error;

    // Handle 401 — but ONLY for protected routes, not for login/register.
    // A 401 on /auth/login simply means "wrong credentials" — we show an
    // error banner. Redirecting to /login would create an infinite loop.
    if (response?.status === 401 && !isAuthRoute(config?.url)) {
      sessionStorage.removeItem('ecovolt_token');
      sessionStorage.removeItem('ecovolt_user');
      window.location.href = '/login';
    }

    // Build a consistent error shape for all consumers (AuthContext, pages)
    const normalizedError = {
      status: response?.status || 500,
      message:
        response?.data?.message || error.message || 'An unexpected error occurred',
      errors: response?.data?.errors || [],
    };

    return Promise.reject(normalizedError);
  },
);

export default apiClient;
