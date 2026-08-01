import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import authService from '@services/authService';

/**
 * Authentication context.
 * Provides user state, auth methods, and loading state to the entire component tree.
 *
 * ─── Response shape from apiClient ────────────────────────────────────────────
 * apiClient's response interceptor returns `response.data` (the raw API JSON):
 *   { success: true, message: "...", data: { user: {...}, token: "..." } }
 *
 * So when we `await authService.login(...)`, we get that full object back.
 * We destructure `.data.user` and `.data.token` to get the nested values.
 */
const AuthContext = createContext(null);

/**
 * Custom hook to consume the auth context.
 * Throws if used outside of an AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Role-to-dashboard path mapping.
 * Used both here and in Login.jsx for role-based redirect after login.
 */
export const ROLE_DASHBOARD_MAP = {
  admin: '/admin',
  generator: '/energy',
  ev_port: '/charging',
  ev_user: '/dashboard',
  fleet_manager: '/fleet',
};

/**
 * AuthProvider component.
 * Manages the full authentication lifecycle:
 *   - Token persistence in localStorage (key: 'ecovolt_token')
 *   - Session restore on page refresh (via useEffect + getProfile)
 *   - Login: saves token + user, returns user to caller
 *   - Logout: clears token + user from memory and storage
 */
export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ecovolt_token'));
  const [loading, setLoading] = useState(true); // true until first profile load resolves
  const [error, setError] = useState(null);

  // Derived: user is authenticated only when BOTH token AND user object exist
  const isAuthenticated = useMemo(() => !!token && !!user, [token, user]);

  // ─── Session Restore ─────────────────────────────────────────────────────────
  /**
   * On mount (and whenever token changes), attempt to restore the session by
   * fetching the user's profile with the stored token.
   *
   * GET /api/auth/profile → { success, message, data: { user } }
   * apiClient returns the full object, so we read `.data.user`.
   */
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await authService.getProfile();
        // res = { success: true, message: "...", data: { user: {...} } }
        setUser(res.data.user);
      } catch {
        // Token is invalid, expired, or revoked — clear everything
        localStorage.removeItem('ecovolt_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // ─── Login ───────────────────────────────────────────────────────────────────
  /**
   * Authenticate with email + password.
   *
   * POST /api/auth/login → { success, message, data: { user, token } }
   *
   * On success:
   *   1. Saves JWT to localStorage (key: 'ecovolt_token') — persists across refreshes
   *   2. Saves token to state — triggers apiClient to attach Authorization header
   *   3. Saves user object to state — makes isAuthenticated = true
   *   4. Returns user so the caller (Login.jsx) can decide where to navigate
   *
   * On failure:
   *   - Sets error string in context (displayed by Login page's authError banner)
   *   - Re-throws so Login.jsx's catch block can stop the spinner
   *
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<object>} user
   */
  const login = useCallback(async (credentials) => {
    setError(null);
    try {
      const res = await authService.login(credentials);
      // res = { success: true, message: "Login successful", data: { user, token } }
      const { user: userData, token: authToken } = res.data;

      // Persist token so it survives page refresh
      localStorage.setItem('ecovolt_token', authToken);

      // Update React state
      setToken(authToken);
      setUser(userData);

      return userData; // Login.jsx uses this to decide the redirect path
    } catch (err) {
      // err = { status: 401, message: "Invalid email or password", errors: [] }
      setError(err.message || 'Login failed. Please try again.');
      throw err; // re-throw so Login.jsx can run setIsSubmitting(false)
    }
  }, []);

  // ─── Register ────────────────────────────────────────────────────────────────
  /**
   * Register a new user account.
   * NOTE: Register.jsx calls authService.register() directly (not this method)
   * because registration redirects to /login rather than auto-logging in.
   * This method is kept for any future use cases that require auto-login on register.
   *
   * @param {object} data
   * @returns {Promise<object>} user
   */
  const register = useCallback(async (data) => {
    setError(null);
    try {
      const res = await authService.register(data);
      const { user: userData, token: authToken } = res.data;
      localStorage.setItem('ecovolt_token', authToken);
      setToken(authToken);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      throw err;
    }
  }, []);

  // ─── Logout ──────────────────────────────────────────────────────────────────
  /**
   * Log out the current user.
   * Fires POST /api/auth/logout to clear the server-side HttpOnly cookie,
   * then clears all local auth state regardless of the server response.
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Server logout errors are non-critical — we always clear local state
    } finally {
      setUser(null);
      setToken(null);
      setError(null);
      localStorage.removeItem('ecovolt_token');
    }
  }, []);

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  /** Clear any displayed error (called before a new submit attempt). */
  const clearError = useCallback(() => setError(null), []);

  /** Return the correct dashboard path for the current user's role. */
  const getDashboardPath = useCallback(() => {
    if (!user) return '/login';
    return ROLE_DASHBOARD_MAP[user.role] || '/dashboard';
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      error,
      isAuthenticated,
      login,
      register,
      logout,
      clearError,
      setUser,
      getDashboardPath,
    }),
    [user, token, loading, error, isAuthenticated, login, register, logout, clearError, getDashboardPath],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
