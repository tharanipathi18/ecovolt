import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import authService from '@services/authService';

/**
 * Authentication context.
 * Provides user state, auth methods, and loading state to the entire component tree.
 */
const AuthContext = createContext(null);

/**
 * Custom hook to consume the auth context.
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
 * Manages full authentication lifecycle: token persistence, auto-login, login, register, logout.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ecovolt_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAuthenticated = useMemo(() => !!token && !!user, [token, user]);

  /**
   * Fetch the current user profile using stored token.
   * Called on app mount to restore session.
   */
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.getProfile();
        setUser(response.data.user);
      } catch (_err) {
        // Token is invalid or expired
        localStorage.removeItem('ecovolt_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  /**
   * Login with email and password.
   */
  const login = useCallback(async (credentials) => {
    setError(null);
    try {
      const response = await authService.login(credentials);
      const { user: userData, token: authToken } = response.data;
      setUser(userData);
      setToken(authToken);
      localStorage.setItem('ecovolt_token', authToken);
      return userData;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  }, []);

  /**
   * Register a new user.
   */
  const register = useCallback(async (data) => {
    setError(null);
    try {
      const response = await authService.register(data);
      const { user: userData, token: authToken } = response.data;
      setUser(userData);
      setToken(authToken);
      localStorage.setItem('ecovolt_token', authToken);
      return userData;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  }, []);

  /**
   * Logout the user.
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (_err) {
      // Ignore logout errors
    } finally {
      setUser(null);
      setToken(null);
      setError(null);
      localStorage.removeItem('ecovolt_token');
    }
  }, []);

  /**
   * Clear any error state.
   */
  const clearError = useCallback(() => setError(null), []);

  /**
   * Get the dashboard path for the current user's role.
   */
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
