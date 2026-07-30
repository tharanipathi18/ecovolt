const VALID_CONNECTOR_TYPES = ['type_1', 'type_2', 'ccs_1', 'ccs_2', 'chademo', 'tesla'];
const VALID_PORT_STATUSES = ['available', 'occupied', 'maintenance', 'offline', 'reserved'];

/**
 * Validate charging port creation request body.
 * @param {object} data
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export const validateCreatePort = (data) => {
  const errors = [];

  if (!data.stationName?.trim()) {
    errors.push('Station name is required');
  }

  if (!data.portIdentifier?.trim()) {
    errors.push('Port identifier (e.g. PORT-01) is required');
  }

  if (!data.connectorType || !VALID_CONNECTOR_TYPES.includes(data.connectorType)) {
    errors.push(`Connector type must be one of: ${VALID_CONNECTOR_TYPES.join(', ')}`);
  }

  if (data.maxPowerOutputKw === undefined || typeof data.maxPowerOutputKw !== 'number' || data.maxPowerOutputKw <= 0) {
    errors.push('Max power output in kW must be a positive number');
  }

  if (!data.location?.address?.trim()) {
    errors.push('Location address is required');
  }

  if (!data.location?.city?.trim()) {
    errors.push('Location city is required');
  }

  if (
    !data.location?.coordinates?.coordinates ||
    !Array.isArray(data.location.coordinates.coordinates) ||
    data.location.coordinates.coordinates.length !== 2
  ) {
    errors.push('Location coordinates must be an array of [longitude, latitude]');
  }

  if (data.ratePerKwh === undefined || typeof data.ratePerKwh !== 'number' || data.ratePerKwh < 0) {
    errors.push('Rate per kWh must be a non-negative number');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate charging session start request body.
 * @param {object} data
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export const validateStartSession = (data) => {
  const errors = [];

  if (!data.chargingPortId) {
    errors.push('Charging port ID is required');
  }

  if (!data.vehicleId) {
    errors.push('Vehicle ID is required');
  }

  if (data.startStateOfCharge !== undefined && (typeof data.startStateOfCharge !== 'number' || data.startStateOfCharge < 0 || data.startStateOfCharge > 100)) {
    errors.push('Start state of charge must be between 0 and 100%');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate renewable energy allocation request body.
 * @param {object} data
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export const validateAllocateEnergy = (data) => {
  const errors = [];

  if (!data.chargingPortId) {
    errors.push('Charging port ID is required');
  }

  if (!data.generatorId) {
    errors.push('Generator ID is required');
  }

  if (data.allocatedKwh === undefined || typeof data.allocatedKwh !== 'number' || data.allocatedKwh <= 0) {
    errors.push('Allocated kWh must be a positive number');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate queue entry request body.
 * @param {object} data
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export const validateAddToQueue = (data) => {
  const errors = [];

  if (!data.chargingPortId) {
    errors.push('Charging port ID is required');
  }

  if (!data.vehicleId) {
    errors.push('Vehicle ID is required');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate port update request body.
 * @param {object} data
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export const validateUpdatePort = (data) => {
  const errors = [];

  if (data.status && !VALID_PORT_STATUSES.includes(data.status)) {
    errors.push(`Status must be one of: ${VALID_PORT_STATUSES.join(', ')}`);
  }

  if (data.ratePerKwh !== undefined && (typeof data.ratePerKwh !== 'number' || data.ratePerKwh < 0)) {
    errors.push('Rate per kWh must be a non-negative number');
  }

  return { isValid: errors.length === 0, errors };
};
