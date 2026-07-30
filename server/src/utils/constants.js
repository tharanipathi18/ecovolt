/**
 * Server-side constants.
 */

export const USER_ROLES = Object.freeze({
  ADMIN: 'admin',
  GENERATOR: 'generator',
  EV_PORT: 'ev_port',
  EV_USER: 'ev_user',
  FLEET_MANAGER: 'fleet_manager',
});

export const ENERGY_SOURCES = Object.freeze({
  SOLAR: 'solar',
  WIND: 'wind',
  HYDRO: 'hydro',
  BIOMASS: 'biomass',
  GEOTHERMAL: 'geothermal',
});

export const PORT_STATUS = Object.freeze({
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
  OFFLINE: 'offline',
  RESERVED: 'reserved',
});

export const SESSION_STATUS = Object.freeze({
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
});

export const CONNECTOR_TYPES = Object.freeze({
  TYPE_1: 'type_1',
  TYPE_2: 'type_2',
  CCS_1: 'ccs_1',
  CCS_2: 'ccs_2',
  CHADEMO: 'chademo',
  TESLA: 'tesla',
});
