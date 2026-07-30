const VALID_ROLES = ['admin', 'generator', 'ev_port', 'ev_user', 'fleet_manager'];
const VALID_SEVERITIES = ['info', 'success', 'warning', 'error'];

/**
 * Validate user role & status update request body.
 */
export const validateUpdateUserRole = (data) => {
  const errors = [];

  if (data.role && !VALID_ROLES.includes(data.role)) {
    errors.push(`Role must be one of: ${VALID_ROLES.join(', ')}`);
  }

  if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
    errors.push('isActive must be a boolean value');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate system notification request body.
 */
export const validateSendNotification = (data) => {
  const errors = [];

  if (!data.title?.trim()) errors.push('Notification title is required');
  if (!data.message?.trim()) errors.push('Notification message is required');

  if (data.severity && !VALID_SEVERITIES.includes(data.severity)) {
    errors.push(`Severity must be one of: ${VALID_SEVERITIES.join(', ')}`);
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate system settings update request body.
 */
export const validateUpdateSystemSettings = (data) => {
  const errors = [];

  if (data.maintenanceMode !== undefined && typeof data.maintenanceMode !== 'boolean') {
    errors.push('maintenanceMode must be a boolean');
  }

  if (data.rateLimitMaxRequests !== undefined && (typeof data.rateLimitMaxRequests !== 'number' || data.rateLimitMaxRequests <= 0)) {
    errors.push('rateLimitMaxRequests must be a positive number');
  }

  return { isValid: errors.length === 0, errors };
};
