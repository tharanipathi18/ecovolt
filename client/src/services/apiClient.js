import axios from 'axios';

/**
 * Pre-configured Axios instance for EcoVolt API calls.
 *
 * Features:
 * - Base URL from environment variables
 * - Automatic JWT token injection via request interceptor
 * - Centralized error handling via response interceptor
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ───────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ecovolt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor ──────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const { response } = error;

    // Handle 401 — Unauthorized (token expired / invalid)
    if (response?.status === 401) {
      localStorage.removeItem('ecovolt_token');
      window.location.href = '/login';
    }

    // Normalize error shape
    const normalizedError = {
      status: response?.status || 500,
      message: response?.data?.message || error.message || 'An unexpected error occurred',
      errors: response?.data?.errors || [],
    };

    return Promise.reject(normalizedError);
  },
);

export default apiClient;
