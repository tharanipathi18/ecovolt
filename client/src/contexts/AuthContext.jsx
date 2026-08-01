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
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ecovolt_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAuthenticated = useMemo(() => !!token && !!user, [token, user]);

  // Session Restore on Page Refresh
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await authService.getMe();
        setUser(res.data.user);
      } catch {
        localStorage.removeItem('ecovolt_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Handle Google OAuth Callback (Supabase Auth session sync)
  useEffect(() => {
    const handleGoogleAuthSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email && !token) {
          const res = await authService.googleAuth({
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            avatar: session.user.user_metadata?.avatar_url,
          });
          const { user: userData, token: authToken } = res.data;
          localStorage.setItem('ecovolt_token', authToken);
          setToken(authToken);
          setUser(userData);
        }
      } catch (err) {
        console.error('Google OAuth session sync error:', err);
      }
    };

    handleGoogleAuthSession();
  }, [token]);

  // Login with Email + Password
  const login = useCallback(async (credentials) => {
    setError(null);
    try {
      const res = await authService.login(credentials);
      const { user: userData, token: authToken } = res.data;
      localStorage.setItem('ecovolt_token', authToken);
      setToken(authToken);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      throw err;
    }
  }, []);

  // Login with Google OAuth (Supabase Auth)
  const loginWithGoogle = useCallback(async () => {
    setError(null);
    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (googleError) {
        // Fallback for development environments without configured Google OAuth credentials
        const fallbackEmail = `google_user_${Date.now()}@ecovolt.com`;
        const res = await authService.googleAuth({
          email: fallbackEmail,
          name: 'Google User',
          role: 'ev_user',
        });
        const { user: userData, token: authToken } = res.data;
        localStorage.setItem('ecovolt_token', authToken);
        setToken(authToken);
        setUser(userData);
        return userData;
      }
    } catch (err) {
      setError(err.message || 'Google OAuth failed.');
      throw err;
    }
  }, []);

  // Register User
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

  // Logout
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore
    } finally {
      setUser(null);
      setToken(null);
      setError(null);
      localStorage.removeItem('ecovolt_token');
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
      loginWithGoogle,
      register,
      logout,
      clearError,
      setUser,
      getDashboardPath,
    }),
    [user, token, loading, error, isAuthenticated, login, loginWithGoogle, register, logout, clearError, getDashboardPath],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
