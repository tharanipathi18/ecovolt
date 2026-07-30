import apiClient from './apiClient';

/**
 * Smart EV Companion API service.
 * Handles vehicle management, battery diagnostics, nearby charging search, slot bookings, charging history, and sustainability metrics.
 */
const evUserService = {
  /** Get user's registered vehicles */
  getVehicles: () => apiClient.get('/ev/vehicles'),

  /** Register a new EV vehicle */
  registerVehicle: (data) => apiClient.post('/ev/vehicles', data),

  /** Get vehicle details & battery report */
  getVehicleDetails: (id) => apiClient.get(`/ev/vehicles/${id}`),

  /** Find nearby charging stations */
  getNearbyStations: (params) => apiClient.get('/ev/nearby-stations', { params }),

  /** Create slot booking */
  createBooking: (data) => apiClient.post('/ev/bookings', data),

  /** Get user's slot bookings */
  getBookings: () => apiClient.get('/ev/bookings'),

  /** Get user's charging history */
  getChargingHistory: () => apiClient.get('/ev/charging-history'),

  /** Get sustainability metrics */
  getSustainabilityMetrics: () => apiClient.get('/ev/sustainability'),

  /** Update user profile */
  updateProfile: (data) => apiClient.put('/ev/profile', data),
};

export default evUserService;
