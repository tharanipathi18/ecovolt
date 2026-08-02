import apiClient from './apiClient';

/**
 * Fleet Management API service.
 * Handles fleet vehicle registration, driver management, complaints, maintenance scheduling, and analytics.
 */
const fleetService = {
  // ─── Fleet Vehicles ──────────────────────────────────────────────
  /** Get all fleet vehicles */
  getFleetVehicles: () => apiClient.get('/fleet/vehicles'),

  /** Register a new commercial fleet vehicle (all fields inline) */
  registerFleetVehicle: (data) => apiClient.post('/fleet/vehicles', data),

  /** Update vehicle status (ACTIVE, IN_MAINTENANCE, CHARGING, INACTIVE) */
  updateVehicleStatus: (id, vehicleStatus) => apiClient.patch(`/fleet/vehicles/${id}/status`, { vehicleStatus }),

  /** Update charging schedule for a fleet vehicle */
  updateSchedule: (id, data) => apiClient.put(`/fleet/vehicles/${id}/schedule`, data),

  // ─── Drivers ─────────────────────────────────────────────────────
  /** Get all drivers employed by this manager */
  getDrivers: () => apiClient.get('/fleet/drivers'),

  /** Create driver (atomically creates User + Driver profile) */
  createDriver: (data) => apiClient.post('/fleet/drivers', data),

  /** Assign driver to fleet vehicle */
  assignDriver: (data) => apiClient.post('/fleet/assign-driver', data),

  // ─── Complaints ───────────────────────────────────────────────────
  /** Get all complaints */
  getComplaints: () => apiClient.get('/fleet/complaints'),

  /** Raise a complaint (driver or fleet manager) */
  createComplaint: (data) => apiClient.post('/fleet/complaints', data),

  /** Update complaint status */
  updateComplaint: (id, status) => apiClient.put(`/fleet/complaints/${id}`, { status }),

  // ─── Maintenance Schedules ────────────────────────────────────────
  /** Get all maintenance schedules */
  getMaintenanceSchedules: () => apiClient.get('/fleet/maintenance'),

  /** Schedule maintenance (in response to a complaint) */
  scheduleMaintenance: (data) => apiClient.post('/fleet/maintenance', data),

  /** Update maintenance schedule status */
  updateMaintenanceStatus: (id, data) => apiClient.put(`/fleet/maintenance/${id}`, data),

  // ─── Analytics ────────────────────────────────────────────────────
  /** Get fleet analytics summary (all from real DB) */
  getFleetAnalytics: () => apiClient.get('/fleet/analytics'),
};

export default fleetService;
