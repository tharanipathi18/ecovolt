export {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
} from './auth.validator.js';

export {
  validateCreateGenerator,
  validateUploadEnergy,
  validateUpdateGenerator,
} from './energy.validator.js';

export {
  validateCreatePort,
  validateStartSession,
  validateAllocateEnergy,
  validateAddToQueue,
  validateUpdatePort,
} from './charging.validator.js';

export {
  validateRegisterVehicle,
  validateCreateBooking,
  validateUpdateProfile,
} from './evUser.validator.js';

export {
  validateRegisterFleetVehicle,
  validateCreateDriver,
  validateAssignDriver,
  validateCreateMaintenance,
} from './fleet.validator.js';

export {
  validateUpdateUserRole,
  validateSendNotification,
  validateUpdateSystemSettings,
} from './admin.validator.js';
