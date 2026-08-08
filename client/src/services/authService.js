import apiClient from './apiClient';

/**
 * Authentication API Service.
 * Manages user registration, email/password login, password reset flows, and profile fetching.
 */
const authService = {

  /** Register new user account */
  register: (userData) => apiClient.post('/auth/register', userData),

  /** Authenticate existing user */
  login: (credentials) => apiClient.post('/auth/login', credentials),

  /** Get currently authenticated user profile */
  getMe: () => apiClient.get('/auth/me'),

  /** Request password reset token */
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),

  /** Reset password using token */
  resetPassword: (token, password) => apiClient.post(`/auth/reset-password/${token}`, { password }),

  /** Change authenticated user password */
  changePassword: (data) => apiClient.put('/auth/change-password', data),
};

export default authService;
