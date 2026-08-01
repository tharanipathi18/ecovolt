import apiClient from './apiClient';

/**
 * Authentication API service.
 * Handles user registration, login, profile, password management.
 */
const authService = {
  /**
   * Register a new user.
   * @param {{ name: string, email: string, password: string, role: string }} data
   */
  register: (data) => apiClient.post('/auth/register', data),

  /**
   * Authenticate user and receive JWT token.
   * @param {{ email: string, password: string }} credentials
   */
  login: (credentials) => apiClient.post('/auth/login', credentials),

  /**
   * Retrieve the currently authenticated user's profile.
   * Uses /auth/profile (primary route); /auth/me is kept as a server alias.
   */
  getProfile: () => apiClient.get('/auth/profile'),

  /**
   * Logout (clear server cookie).
   */
  logout: () => apiClient.post('/auth/logout'),

  /**
   * Request password reset email.
   * @param {{ email: string }} data
   */
  forgotPassword: (data) => apiClient.post('/auth/forgot-password', data),

  /**
   * Reset password with token.
   * @param {string} token
   * @param {{ password: string, confirmPassword: string }} data
   */
  resetPassword: (token, data) => apiClient.post(`/auth/reset-password/${token}`, data),

  /**
   * Change password (authenticated).
   * @param {{ currentPassword: string, newPassword: string }} data
   */
  changePassword: (data) => apiClient.put('/auth/change-password', data),
};

export default authService;
