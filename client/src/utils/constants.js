/**
 * Application-wide constants.
 */

// ─── User Roles ────────────────────────────────────────────────────
export const USER_ROLES = Object.freeze({
  ADMIN: 'admin',
  GENERATOR: 'generator',
  EV_PORT: 'ev_port',
  EV_USER: 'ev_user',
  FLEET_MANAGER: 'fleet_manager',
});

// ─── Role Display Labels ──────────────────────────────────────────
export const ROLE_LABELS = Object.freeze({
  admin: 'Administrator',
  generator: 'Energy Generator',
  ev_port: 'EV Charging Port',
  ev_user: 'EV User',
  fleet_manager: 'Fleet Manager',
});

// ─── Roles available for registration ─────────────────────────────
export const REGISTERABLE_ROLES = [
  { value: 'ev_user', label: 'EV User', description: 'Individual electric vehicle owner' },
  { value: 'fleet_manager', label: 'Fleet Manager', description: 'Manage a fleet of EVs' },
  { value: 'generator', label: 'Energy Generator', description: 'Renewable energy producer' },
  { value: 'ev_port', label: 'EV Charging Port', description: 'Charging station operator' },
];

// ─── Energy Source Types ───────────────────────────────────────────
export const ENERGY_SOURCES = Object.freeze({
  SOLAR: 'solar',
  WIND: 'wind',
  HYDRO: 'hydro',
  BIOMASS: 'biomass',
  GEOTHERMAL: 'geothermal',
});

// ─── Charging Port Status ──────────────────────────────────────────
export const PORT_STATUS = Object.freeze({
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
  OFFLINE: 'offline',
  RESERVED: 'reserved',
});

// ─── Charging Session Status ───────────────────────────────────────
export const SESSION_STATUS = Object.freeze({
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
});

// ─── Connector Types ──────────────────────────────────────────────
export const CONNECTOR_TYPES = Object.freeze({
  TYPE_1: 'type_1',
  TYPE_2: 'type_2',
  CCS_1: 'ccs_1',
  CCS_2: 'ccs_2',
  CHADEMO: 'chademo',
  TESLA: 'tesla',
});

// ─── API Routes ───────────────────────────────────────────────────
export const API_ROUTES = Object.freeze({
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/me',
    REFRESH: '/auth/refresh',
  },
  ENERGY: {
    GENERATORS: '/energy/generators',
    PRODUCTION: '/energy/production',
    ALLOCATION: '/energy/allocation',
  },
  CHARGING: {
    STATIONS: '/charging/stations',
    SESSIONS: '/charging/sessions',
    DEMAND: '/charging/demand',
  },
  FLEET: {
    BASE: '/fleet',
    ANALYTICS: '/fleet/analytics',
  },
  ADMIN: {
    USERS: '/admin/users',
    SYSTEM: '/admin/system',
  },
});

// ─── App Config ───────────────────────────────────────────────────
export const APP_CONFIG = Object.freeze({
  APP_NAME: import.meta.env.VITE_APP_NAME || 'EcoVolt',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  PAGINATION_DEFAULT_LIMIT: 20,
  TOKEN_KEY: 'ecovolt_token',
  THEME_KEY: 'ecovolt_theme',
});
