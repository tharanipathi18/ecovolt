import apiClient from './apiClient';

/**
 * Admin Governance API service.
 * Handles system overview, user governance & role updates, station application reviews, asset oversight, energy transaction ledgers, and notification broadcasting.
 */
const adminService = {
  /** Get platform overview metrics */
  getOverview: () => apiClient.get('/admin/overview'),

  /** Get all users */
  getUsers: (params) => apiClient.get('/admin/users', { params }),

  /** Update user role or active status */
  updateUserRole: (id, data) => apiClient.put(`/admin/users/${id}`, data),

  /** Get pending station applications awaiting approval */
  getPendingStationApplications: () => apiClient.get('/admin/station-applications/pending'),

  /** Approve or Reject station application */
  reviewStationApplication: (id, decision) => apiClient.put(`/admin/station-applications/${id}/review`, { decision }),

  /** Get all registered vehicles */
  getVehicles: () => apiClient.get('/admin/vehicles'),

  /** Get all slot bookings */
  getBookings: () => apiClient.get('/admin/bookings'),

  /** Get all charging sessions */
  getSessions: () => apiClient.get('/admin/sessions'),

  /** Get all system generators */
  getGenerators: () => apiClient.get('/admin/generators'),

  /** Get all system charging ports */
  getChargingPorts: () => apiClient.get('/admin/ports'),
};

export default adminService;
