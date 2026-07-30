import apiClient from './apiClient';

/**
 * Admin Governance API service.
 * Handles system overview, user governance & role updates, asset oversight, energy transaction ledgers, notification broadcasting, and system configuration settings.
 */
const adminService = {
  /** Get platform overview metrics */
  getOverview: () => apiClient.get('/admin/overview'),

  /** Get all users */
  getUsers: (params) => apiClient.get('/admin/users', { params }),

  /** Update user role or active status */
  updateUser: (id, data) => apiClient.put(`/admin/users/${id}`, data),

  /** Get all system generators */
  getGenerators: () => apiClient.get('/admin/generators'),

  /** Get all system charging ports */
  getPorts: () => apiClient.get('/admin/ports'),

  /** Get all energy transactions */
  getTransactions: () => apiClient.get('/admin/transactions'),

  /** Dispatch broadcast or target notification */
  sendNotification: (data) => apiClient.post('/admin/notifications', data),

  /** Get system settings */
  getSettings: () => apiClient.get('/admin/settings'),

  /** Update system settings */
  updateSettings: (data) => apiClient.put('/admin/settings', data),
};

export default adminService;
