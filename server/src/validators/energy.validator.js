const VALID_TYPES = ['solar', 'wind', 'hydro', 'biomass', 'geothermal'];
const VALID_GRID_CONNECTIONS = ['grid', 'microgrid', 'hybrid'];
const VALID_STATUSES = ['active', 'inactive', 'maintenance', 'faulted'];

/**
 * Validate generator creation request body.
 * @param {object} data
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export const validateCreateGenerator = (data) => {
  const errors = [];

  if (!data.name?.trim()) {
    errors.push('Generator name is required');
  }

  if (!data.type || !VALID_TYPES.includes(data.type)) {
    errors.push(`Energy type must be one of: ${VALID_TYPES.join(', ')}`);
  }

  if (data.capacityKw === undefined || typeof data.capacityKw !== 'number' || data.capacityKw <= 0) {
    errors.push('Capacity in kW must be a positive number');
  }

  if (!data.locationAddress?.trim()) {
    errors.push("Location address is required");
  }

  if (!data.locationCity?.trim()) {
    errors.push("Location city is required");
  }

  if (data.gridConnection && !VALID_GRID_CONNECTIONS.includes(data.gridConnection)) {
    errors.push(`Grid connection must be one of: ${VALID_GRID_CONNECTIONS.join(', ')}`);
  }

  if (data.tariffRatePerKwh !== undefined && (typeof data.tariffRatePerKwh !== 'number' || data.tariffRatePerKwh < 0)) {
    errors.push('Tariff rate per kWh must be a non-negative number');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate energy upload request body.
 * @param {object} data
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export const validateUploadEnergy = (data) => {
  const errors = [];

  if (!data.generatorId) {
    errors.push('Generator ID is required');
  }

  if (data.energyGeneratedKwh === undefined || typeof data.energyGeneratedKwh !== 'number' || data.energyGeneratedKwh <= 0) {
    errors.push('Energy generated in kWh must be a positive number');
  }

  if (data.peakOutputKw === undefined || typeof data.peakOutputKw !== 'number' || data.peakOutputKw < 0) {
    errors.push('Peak output in kW must be a non-negative number');
  }

  if (data.excessEnergyKwh !== undefined && (typeof data.excessEnergyKwh !== 'number' || data.excessEnergyKwh < 0)) {
    errors.push('Excess energy in kWh must be a non-negative number');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Validate generator update request body.
 * @param {object} data
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export const validateUpdateGenerator = (data) => {
  const errors = [];

  if (data.type && !VALID_TYPES.includes(data.type)) {
    errors.push(`Energy type must be one of: ${VALID_TYPES.join(', ')}`);
  }

  if (data.status && !VALID_STATUSES.includes(data.status)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  if (data.capacityKw !== undefined && (typeof data.capacityKw !== 'number' || data.capacityKw <= 0)) {
    errors.push('Capacity in kW must be a positive number');
  }

  return { isValid: errors.length === 0, errors };
};
