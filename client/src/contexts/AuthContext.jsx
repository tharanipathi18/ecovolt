import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import authService from '@services/authService';
import { supabase } from '@config/supabase';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const ROLE_DASHBOARD_MAP = {
  admin: '/admin',
  generator: '/energy',
  ev_port: '/charging',
  ev_user: '/dashboard',
  fleet_manager: '/fleet',
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('ecovolt_token'));
  const [user, setUser] = useState(() => {
    const cached = sessionStorage.getItem('ecovolt_user');
    try {
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAuthenticated = useMemo(() => !!token && !!user, [token, user]);

  // Session Restore on Page Refresh (Tab-Specific)
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await authService.getMe();
        setUser(res.data.user);
        sessionStorage.setItem('ecovolt_user', JSON.stringify(res.data.user));
      } catch {
        sessionStorage.removeItem('ecovolt_token');
        sessionStorage.removeItem('ecovolt_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Login with Email + Password
  const login = useCallback(async (credentials) => {
    setError(null);
    try {
      const res = await authService.login(credentials);
      const { user: userData, token: authToken } = res.data;
      sessionStorage.setItem('ecovolt_token', authToken);
      sessionStorage.setItem('ecovolt_user', JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      throw err;
    }
  }, []);

  // Register User
  const register = useCallback(async (data) => {
    setError(null);
    try {
      const res = await authService.register(data);
      const { user: userData, token: authToken } = res.data;
      sessionStorage.setItem('ecovolt_token', authToken);
      sessionStorage.setItem('ecovolt_user', JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      throw err;
    }
  }, []);

  // Logout (Clears ONLY Current Tab's Session)
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setUser(null);
      setToken(null);
      setError(null);
      sessionStorage.removeItem('ecovolt_token');
      sessionStorage.removeItem('ecovolt_user');
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

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
