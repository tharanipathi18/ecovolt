const VALID_PRIORITIES = ['high', 'medium', 'low', 'scheduled_window'];

/**
 * Validate fleet vehicle registration request body.
 */
export const validateRegisterFleetVehicle = (data) => {
  const errors = [];

  if (!data.fleetName?.trim()) errors.push('Fleet name is required');
  if (!data.vehicleId) errors.push('Vehicle reference is required');
  if (!data.fleetUnitNumber?.trim()) errors.push('Fleet unit number is required');

  if (data.chargingPriority && !VALID_PRIORITIES.includes(data.chargingPriority)) {
    errors.push(`Charging priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate driver creation request body.
 */
export const validateCreateDriver = (data) => {
  const errors = [];

  if (!data.userId) errors.push('User reference is required');
  if (!data.licenseNumber?.trim()) errors.push('Driver license number is required');
  if (!data.licenseExpirationDate) errors.push('License expiration date is required');

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate driver assignment request body.
 */
export const validateAssignDriver = (data) => {
  const errors = [];

  if (!data.fleetVehicleId) errors.push('Fleet vehicle ID is required');
  if (!data.driverId) errors.push('Driver ID is required');

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate maintenance report request body.
 */
export const validateCreateMaintenance = (data) => {
  const errors = [];

  if (!data.vehicleId && !data.chargingPortId && !data.generatorId) {
    errors.push('Target vehicle, port, or generator reference is required');
  }

  if (!data.title?.trim()) errors.push('Maintenance title is required');
  if (!data.description?.trim()) errors.push('Maintenance description is required');

  return { isValid: errors.length === 0, errors };
};
