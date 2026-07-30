from pydantic import BaseModel, Field
from typing import List, Optional

# ─── 1. Demand Prediction Schemas ──────────────────────────────
class DemandPredictionInput(BaseModel):
    charging_port_id: str = Field(..., example="PORT-101")
    hour_of_day: int = Field(..., ge=0, le=23, example=14)
    day_of_week: int = Field(..., ge=0, le=6, example=2)  # 0=Monday, 6=Sunday
    temperature_celsius: float = Field(default=25.0, example=28.5)
    historical_avg_kwh: float = Field(default=45.0, example=52.0)
    connector_type: str = Field(default="ccs_2", example="ccs_2")

class DemandPredictionOutput(BaseModel):
    charging_port_id: str
    predicted_demand_kw: float
    confidence_score: float
    peak_demand_window: str
    recommended_active_ports: int

# ─── 2. Battery Health Prediction Schemas ──────────────────────
class BatteryHealthInput(BaseModel):
    vehicle_id: str = Field(..., example="VEH-101")
    charge_cycles_count: int = Field(..., ge=0, example=350)
    avg_temperature_celsius: float = Field(default=28.0, example=32.0)
    fast_charge_ratio: float = Field(default=0.4, ge=0.0, le=1.0, example=0.45)
    pack_voltage: float = Field(default=400.0, example=395.0)

class BatteryHealthOutput(BaseModel):
    vehicle_id: str
    predicted_soh_percentage: float
    remaining_useful_life_cycles: int
    health_category: str  # EXCELLENT, GOOD, MODERATE, DEGRADED
    thermal_stress_risk: str

# ─── 3. Predictive Maintenance Schemas ─────────────────────────
class PredictiveMaintenanceInput(BaseModel):
    asset_id: str = Field(..., example="GEN-SOLAR-01")
    asset_type: str = Field(..., example="generator")  # generator, port, vehicle
    operating_hours: float = Field(..., ge=0, example=4200.0)
    temperature_anomalies_count: int = Field(default=2, example=4)
    efficiency_decay_rate: float = Field(default=0.02, example=0.05)

class PredictiveMaintenanceOutput(BaseModel):
    asset_id: str
    asset_type: str
    failure_probability: float
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    recommended_maintenance_date: str
    maintenance_action: str

# ─── 4. Charging Recommendation Schemas ───────────────────────
class ChargingRecommendationInput(BaseModel):
    vehicle_id: str = Field(..., example="VEH-101")
    current_soc_percentage: float = Field(..., ge=0.0, le=100.0, example=35.0)
    target_soc_percentage: float = Field(default=85.0, ge=0.0, le=100.0, example=85.0)
    battery_capacity_kwh: float = Field(default=75.0, example=75.0)
    target_ready_time_hour: int = Field(default=8, ge=0, le=23, example=7)

class ChargingRecommendationOutput(BaseModel):
    vehicle_id: str
    optimal_charge_window: str
    recommended_power_kw: float
    estimated_duration_minutes: int
    renewable_matching_ratio: float
    cost_savings_percentage: float
    co2_reduction_kg: float
