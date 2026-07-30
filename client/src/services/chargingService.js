import apiClient from './apiClient';

/**
 * EV Charging Port API service.
 * Handles port management, charging session lifecycle, queue management, energy credit allocation, and analytics reports.
 */
const chargingService = {
  /** Get all charging ports */
  getPorts: (params) => apiClient.get('/charging/ports', { params }),

  /** Get single charging port by ID */
  getPortById: (id) => apiClient.get(`/charging/ports/${id}`),

  /** Create a new charging port */
  createPort: (data) => apiClient.post('/charging/ports', data),

  /** Update charging port configuration or status */
  updatePort: (id, data) => apiClient.put(`/charging/ports/${id}`, data),

  /** Start a new charging session */
  startSession: (data) => apiClient.post('/charging/sessions/start', data),

  /** Stop an active charging session */
  stopSession: (id, data) => apiClient.patch(`/charging/sessions/${id}/stop`, data),

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
