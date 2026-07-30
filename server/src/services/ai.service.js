import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const aiClient = axios.create({
  baseURL: `${AI_SERVICE_URL}/api/v1`,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Predict EV Charging Station Demand
 */
export const predictDemand = async (data) => {
  try {
    const response = await aiClient.post('/predict/demand', {
      charging_port_id: data.chargingPortId || 'PORT-101',
      hour_of_day: data.hourOfDay !== undefined ? data.hourOfDay : new Date().getHours(),
      day_of_week: data.dayOfWeek !== undefined ? data.dayOfWeek : new Date().getDay(),
      temperature_celsius: data.temperatureCelsius || 25.0,
      historical_avg_kwh: data.historicalAvgKwh || 45.0,
      connector_type: data.connectorType || 'ccs_2',
    });
    return response.data;
  } catch {
    // Fallback response if AI service is offline
    return {
      charging_port_id: data.chargingPortId || 'PORT-101',
      predicted_demand_kw: 68.5,
      confidence_score: 0.92,
      peak_demand_window: '13:00 - 19:00 (Evening Peak)',
      recommended_active_ports: 3,
      isFallback: true,
    };
  }
};

/**
 * Predict Battery Health & Lifetime
 */
export const predictBatteryHealth = async (data) => {
  try {
    const response = await aiClient.post('/predict/battery-health', {
      vehicle_id: data.vehicleId || 'VEH-101',
      charge_cycles_count: data.chargeCyclesCount || 350,
      avg_temperature_celsius: data.avgTemperatureCelsius || 28.0,
      fast_charge_ratio: data.fastChargeRatio || 0.4,
      pack_voltage: data.packVoltage || 395.0,
    });
    return response.data;
  } catch {
    return {
      vehicle_id: data.vehicleId || 'VEH-101',
      predicted_soh_percentage: 94.5,
      remaining_useful_life_cycles: 1250,
      health_category: 'EXCELLENT',
      thermal_stress_risk: 'LOW',
      isFallback: true,
    };
  }
};

/**
 * Predict Predictive Maintenance
 */
export const predictMaintenance = async (data) => {
  try {
    const response = await aiClient.post('/predict/maintenance', {
      asset_id: data.assetId || 'GEN-SOLAR-01',
      asset_type: data.assetType || 'generator',
      operating_hours: data.operatingHours || 4200.0,
      temperature_anomalies_count: data.temperatureAnomaliesCount || 2,
      efficiency_decay_rate: data.efficiencyDecayRate || 0.02,
    });
    return response.data;
  } catch {
    return {
      asset_id: data.assetId || 'GEN-SOLAR-01',
      asset_type: data.assetType || 'generator',
      failure_probability: 0.12,
      risk_level: 'LOW',
      recommended_maintenance_date: '2026-09-15',
      maintenance_action: 'Asset operating within normal nominal parameters',
      isFallback: true,
    };
  }
};

/**
 * Recommend Optimal Clean Charging Window
 */
export const recommendCharging = async (data) => {
  try {
    const response = await aiClient.post('/recommend/charging', {
      vehicle_id: data.vehicleId || 'VEH-101',
      current_soc_percentage: data.currentSocPercentage || 35.0,
      target_soc_percentage: data.targetSocPercentage || 85.0,
      battery_capacity_kwh: data.batteryCapacityKwh || 75.0,
      target_ready_time_hour: data.targetReadyTimeHour || 7,
    });
    return response.data;
  } catch {
    return {
      vehicle_id: data.vehicleId || 'VEH-101',
      optimal_charge_window: '22:00 - 04:00 (Off-Peak Wind Window)',
      recommended_power_kw: 50.0,
      estimated_duration_minutes: 45,
      renewable_matching_ratio: 94.5,
      cost_savings_percentage: 32.0,
      co2_reduction_kg: 26.4,
      isFallback: true,
    };
  }
};
