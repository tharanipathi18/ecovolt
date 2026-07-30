import apiClient from './apiClient';

/**
 * Fleet Management API service.
 * Handles commercial fleet vehicle registration, driver management & assignments, charging schedule optimization, maintenance, and analytics.
 */
const fleetService = {
  /** Get all fleet vehicles */
  getFleetVehicles: () => apiClient.get('/fleet/vehicles'),

  /** Register a commercial vehicle into fleet */
  registerFleetVehicle: (data) => apiClient.post('/fleet/vehicles', data),

  /** Get commercial drivers */
  getDrivers: () => apiClient.get('/fleet/drivers'),

  /** Create driver profile */
  createDriver: (data) => apiClient.post('/fleet/drivers', data),

  /** Assign driver to fleet vehicle */
  assignDriver: (data) => apiClient.post('/fleet/assign-driver', data),

  /** Update charging schedule for vehicle */
  updateSchedule: (id, data) => apiClient.put(`/fleet/schedule/${id}`, data),

  /** File maintenance report */
  createMaintenanceReport: (data) => apiClient.post('/fleet/maintenance', data),

  /** Get maintenance reports */
  getMaintenanceReports: () => apiClient.get('/fleet/maintenance'),

  /** Get fleet analytics summary */
  getFleetAnalytics: () => apiClient.get('/fleet/analytics'),
};

export default fleetService;
