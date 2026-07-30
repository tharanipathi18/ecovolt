from fastapi import APIRouter, HTTPException, status
from app.schemas.predict import (
    DemandPredictionInput,
    DemandPredictionOutput,
    BatteryHealthInput,
    BatteryHealthOutput,
    PredictiveMaintenanceInput,
    PredictiveMaintenanceOutput,
)
from app.services.ml_models import (
    demand_predictor,
    battery_predictor,
    maintenance_predictor,
)

router = APIRouter()

@router.post("/demand", response_model=DemandPredictionOutput, summary="Predict EV Charging Station Demand")
async def predict_demand(input_data: DemandPredictionInput):
    """
    Predicts charging demand (kW) and optimal active ports count for a given charging station using Random Forest regression.
    """
    try:
        kw, confidence, peak_window, rec_ports = demand_predictor.predict(
            hour=input_data.hour_of_day,
            day_of_week=input_data.day_of_week,
            temp=input_data.temperature_celsius,
            historical_kwh=input_data.historical_avg_kwh,
        )

        return DemandPredictionOutput(
            charging_port_id=input_data.charging_port_id,
            predicted_demand_kw=kw,
            confidence_score=confidence,
            peak_demand_window=peak_window,
            recommended_active_ports=rec_ports,
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/battery-health", response_model=BatteryHealthOutput, summary="Predict EV Battery Health & Lifetime")
async def predict_battery_health(input_data: BatteryHealthInput):
    """
    Predicts EV battery State of Health (SoH %) and remaining useful charge cycle life.
    """
    try:
        soh, rul, category, thermal_risk = battery_predictor.predict(
            cycles=input_data.charge_cycles_count,
            temp=input_data.avg_temperature_celsius,
            fast_charge_ratio=input_data.fast_charge_ratio,
            voltage=input_data.pack_voltage,
        )

        return BatteryHealthOutput(
            vehicle_id=input_data.vehicle_id,
            predicted_soh_percentage=soh,
            remaining_useful_life_cycles=rul,
            health_category=category,
            thermal_stress_risk=thermal_risk,
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/maintenance", response_model=PredictiveMaintenanceOutput, summary="Predict Asset Failure Probability")
async def predict_maintenance(input_data: PredictiveMaintenanceInput):
    """
    Predicts hardware failure probability and recommended maintenance date for generators, charging ports, and vehicles.
    """
    try:
        prob, risk, maint_date, action = maintenance_predictor.predict(
            asset_type=input_data.asset_type,
            operating_hours=input_data.operating_hours,
            temp_anomalies=input_data.temperature_anomalies_count,
            decay_rate=input_data.efficiency_decay_rate,
        )

        return PredictiveMaintenanceOutput(
            asset_id=input_data.asset_id,
            asset_type=input_data.asset_type,
            failure_probability=prob,
            risk_level=risk,
            recommended_maintenance_date=maint_date,
            maintenance_action=action,
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
