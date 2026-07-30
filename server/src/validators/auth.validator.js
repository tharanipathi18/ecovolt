import validator from 'validator';

const VALID_ROLES = ['admin', 'generator', 'ev_port', 'ev_user', 'fleet_manager'];

/**
 * Validate registration request body.
 * @param {object} data
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export const validateRegister = (data) => {
  const errors = [];

  if (!data.name?.trim()) {
    errors.push('Name is required');
  } else if (data.name.trim().length > 100) {
    errors.push('Name cannot exceed 100 characters');
  }

  if (!data.email) {
    errors.push('Email is required');
  } else if (!validator.isEmail(data.email)) {
    errors.push('Please provide a valid email address');
  }

  if (!data.password) {
    errors.push('Password is required');
  } else {
    if (data.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/(?=.*[a-z])/.test(data.password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(data.password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(data.password)) {
      errors.push('Password must contain at least one number');
    }
  }

  if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) {
    errors.push('Passwords do not match');
  }

  if (data.role && !VALID_ROLES.includes(data.role)) {
    errors.push(`Role must be one of: ${VALID_ROLES.join(', ')}`);
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate login request body.
 * @param {object} data
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export const validateLogin = (data) => {
  const errors = [];

  if (!data.email) {
    errors.push('Email is required');
  } else if (!validator.isEmail(data.email)) {
    errors.push('Please provide a valid email address');
  }

  if (!data.password) {
    errors.push('Password is required');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate forgot password request body.
 * @param {object} data
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export const validateForgotPassword = (data) => {
  const errors = [];

  if (!data.email) {
    errors.push('Email is required');
  } else if (!validator.isEmail(data.email)) {
    errors.push('Please provide a valid email address');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate reset password request body.
 * @param {object} data
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export const validateResetPassword = (data) => {
  const errors = [];

  if (!data.password) {
    errors.push('New password is required');
  } else if (data.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) {
    errors.push('Passwords do not match');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate change password request body.
 * @param {object} data
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export const validateChangePassword = (data) => {
  const errors = [];

  if (!data.currentPassword) {
    errors.push('Current password is required');
  }

  if (!data.newPassword) {
    errors.push('New password is required');
  } else if (data.newPassword.length < 8) {
    errors.push('New password must be at least 8 characters');
  }

  if (data.currentPassword && data.newPassword && data.currentPassword === data.newPassword) {
    errors.push('New password must be different from current password');
  }

  return { isValid: errors.length === 0, errors };
};
