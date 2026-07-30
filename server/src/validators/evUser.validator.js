const VALID_CONNECTORS = ['type_1', 'type_2', 'ccs_1', 'ccs_2', 'chademo', 'tesla'];

/**
 * Validate vehicle registration request body.
 */
export const validateRegisterVehicle = (data) => {
  const errors = [];

  if (!data.make?.trim()) errors.push('Vehicle make is required');
  if (!data.model?.trim()) errors.push('Vehicle model is required');

  if (data.year === undefined || typeof data.year !== 'number' || data.year < 2010) {
    errors.push('Manufacturing year must be 2010 or later');
  }

  if (!data.licensePlate?.trim()) errors.push('License plate is required');

  if (data.batteryCapacityKwh === undefined || typeof data.batteryCapacityKwh !== 'number' || data.batteryCapacityKwh <= 0) {
    errors.push('Battery capacity in kWh must be a positive number');
  }

  if (!data.connectorType || !VALID_CONNECTORS.includes(data.connectorType)) {
    errors.push(`Connector type must be one of: ${VALID_CONNECTORS.join(', ')}`);
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate booking creation request body.
 */
export const validateCreateBooking = (data) => {
  const errors = [];

  if (!data.chargingPortId) errors.push('Charging port ID is required');
  if (!data.vehicleId) errors.push('Vehicle ID is required');
  if (!data.scheduledStartTime) errors.push('Scheduled start time is required');

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate profile update request body.
 */
export const validateUpdateProfile = (data) => {
  const errors = [];

  if (data.name !== undefined && !data.name.trim()) {
    errors.push('Name cannot be empty');
  }

  return { isValid: errors.length === 0, errors };
};
