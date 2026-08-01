import apiClient from './apiClient';

/**
 * EV Charging Port API service.
 * Handles station applications, port management, charging session lifecycle, queue management, and analytics reports.
 */
const chargingService = {
  /** Submit Charging Station Owner application */
  applyStation: (data) => apiClient.post('/charging/apply-station', data),

  /** Get all charging ports */
  getPorts: (params) => apiClient.get('/charging/ports', { params }),

  /** Get single charging port by ID */
  getPortById: (id) => apiClient.get(`/charging/ports/${id}`),

  /** Create a new charging port */
  createPort: (data) => apiClient.post('/charging/ports', data),

  /** Update charging port configuration or status */
  updatePort: (id, data) => apiClient.put(`/charging/ports/${id}`, data),

  /** Get charging sessions (active/completed) */
  getSessions: (params) => apiClient.get('/charging/sessions', { params }),

  /** Start a new charging session */
  startSession: (data) => apiClient.post('/charging/sessions/start', data),

  /** Stop / Release an active charging session */
  stopSession: (id, data) => apiClient.patch(`/charging/sessions/${id}/stop`, data),

  /** Get operator's bookings to review */
  getBookings: () => apiClient.get('/charging/bookings'),

  /** Accept / Reject booking status */
  updateBookingStatus: (id, status) => apiClient.put(`/charging/bookings/${id}/status`, { status }),

  /** Allocate renewable energy from generator to port */
  allocateEnergy: (data) => apiClient.post('/charging/allocate-energy', data),

  /** Get waiting queue for a port */
  getQueue: (portId) => apiClient.get(`/charging/queue/${portId}`),

  /** Add vehicle to waiting queue */
  addToQueue: (data) => apiClient.post('/charging/queue', data),

  /** Get charging analytics report */
  getAnalytics: () => apiClient.get('/charging/analytics'),
};

export default chargingService;
