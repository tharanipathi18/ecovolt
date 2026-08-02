const VALID_VEHICLE_TYPES = ['van', 'truck', 'car', 'bus', 'bike', 'suv'];
const VALID_CONNECTOR_TYPES = ['type_1', 'type_2', 'ccs_1', 'ccs_2', 'chademo', 'tesla'];
const VALID_CHARGING_PRIORITIES = ['high', 'medium', 'low'];
const VALID_VEHICLE_STATUSES = ['ACTIVE', 'IN_MAINTENANCE', 'CHARGING', 'INACTIVE'];
const VALID_COMPLAINT_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const VALID_COMPLAINT_CATEGORIES = ['BATTERY', 'BRAKE', 'TYRE', 'CHARGING', 'MOTOR', 'OTHER'];
const VALID_MAINTENANCE_STATUSES = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

/**
 * Validate fleet vehicle registration request.
 * All vehicle data is stored inline — no vehicleId FK required.
 */
export const validateRegisterFleetVehicle = (data) => {
  const errors = [];

  if (!data.registrationNumber?.trim()) errors.push('Vehicle registration number is required');
  if (!data.make?.trim()) errors.push('Vehicle make/brand is required');
  if (!data.model?.trim()) errors.push('Vehicle model is required');
  if (!data.batteryCapacityKwh || isNaN(parseFloat(data.batteryCapacityKwh))) {
    errors.push('Battery capacity (kWh) must be a valid number');
  }

  if (data.vehicleType && !VALID_VEHICLE_TYPES.includes(data.vehicleType)) {
    errors.push(`Vehicle type must be one of: ${VALID_VEHICLE_TYPES.join(', ')}`);
  }
  if (data.connectorType && !VALID_CONNECTOR_TYPES.includes(data.connectorType)) {
    errors.push(`Connector type must be one of: ${VALID_CONNECTOR_TYPES.join(', ')}`);
  }
  if (data.chargingPriority && !VALID_CHARGING_PRIORITIES.includes(data.chargingPriority)) {
    errors.push(`Charging priority must be one of: ${VALID_CHARGING_PRIORITIES.join(', ')}`);
  }
  if (data.vehicleStatus && !VALID_VEHICLE_STATUSES.includes(data.vehicleStatus)) {
    errors.push(`Vehicle status must be one of: ${VALID_VEHICLE_STATUSES.join(', ')}`);
  }
  if (data.manufacturingYear) {
    const year = parseInt(data.manufacturingYear);
    if (isNaN(year) || year < 2000 || year > new Date().getFullYear() + 1) {
      errors.push('Manufacturing year must be between 2000 and next year');
    }
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate driver creation request.
 * Creates a User account + Driver profile atomically.
 */
export const validateCreateDriver = (data) => {
  const errors = [];

  if (!data.name?.trim()) errors.push('Driver full name is required');
  if (!data.email?.trim()) errors.push('Driver email address is required');
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Driver email must be a valid email address');
  }
  if (!data.licenseNumber?.trim()) errors.push('Driving license number is required');
  if (!data.licenseExpirationDate) errors.push('License expiration date is required');
  if (data.licenseExpirationDate && new Date(data.licenseExpirationDate) < new Date()) {
    errors.push('License expiration date must be in the future');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate driver assignment request.
 */
export const validateAssignDriver = (data) => {
  const errors = [];

  if (!data.fleetVehicleId) errors.push('Fleet vehicle ID is required');
  if (!data.driverId) errors.push('Driver ID is required');

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate complaint creation request.
 */
export const validateCreateComplaint = (data) => {
  const errors = [];

  if (!data.fleetVehicleId) errors.push('Fleet vehicle ID is required');
  if (!data.title?.trim()) errors.push('Complaint title is required');
  if (!data.description?.trim()) errors.push('Complaint description is required');
  if (data.priority && !VALID_COMPLAINT_PRIORITIES.includes(data.priority)) {
    errors.push(`Priority must be one of: ${VALID_COMPLAINT_PRIORITIES.join(', ')}`);
  }
  if (data.category && !VALID_COMPLAINT_CATEGORIES.includes(data.category)) {
    errors.push(`Category must be one of: ${VALID_COMPLAINT_CATEGORIES.join(', ')}`);
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate maintenance schedule creation request.
 */
export const validateScheduleMaintenance = (data) => {
  const errors = [];

  if (!data.fleetVehicleId) errors.push('Fleet vehicle ID is required');
  if (!data.mechanic?.trim()) errors.push('Mechanic name is required');
  if (!data.workshop?.trim()) errors.push('Workshop name is required');
  if (!data.maintenanceDate) errors.push('Maintenance date is required');
  if (!data.description?.trim()) errors.push('Maintenance description is required');
  if (data.estimatedCost !== undefined && isNaN(parseFloat(data.estimatedCost))) {
    errors.push('Estimated cost must be a valid number');
  }
  if (data.status && !VALID_MAINTENANCE_STATUSES.includes(data.status)) {
    errors.push(`Status must be one of: ${VALID_MAINTENANCE_STATUSES.join(', ')}`);
  }

  return { isValid: errors.length === 0, errors };
};
