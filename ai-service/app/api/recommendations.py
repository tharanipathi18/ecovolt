from fastapi import APIRouter, HTTPException, status
from app.schemas.predict import (
    ChargingRecommendationInput,
    ChargingRecommendationOutput,
)
from app.services.ml_models import recommendation_engine

router = APIRouter()

@router.post("/charging", response_model=ChargingRecommendationOutput, summary="Recommend Optimal Renewable Charging Window")
async def recommend_charging(input_data: ChargingRecommendationInput):
    """
    Recommends optimal clean charging time window, charging power (kW), and cost/carbon savings percentage.
    """
    try:
        window, power, duration, clean_ratio, savings, co2_reduced = recommendation_engine.recommend(
            current_soc=input_data.current_soc_percentage,
            target_soc=input_data.target_soc_percentage,
            capacity_kwh=input_data.battery_capacity_kwh,
            ready_hour=input_data.target_ready_time_hour,
        )

        return ChargingRecommendationOutput(
            vehicle_id=input_data.vehicle_id,
            optimal_charge_window=window,
            recommended_power_kw=power,
            estimated_duration_minutes=duration,
            renewable_matching_ratio=clean_ratio,
            cost_savings_percentage=savings,
            co2_reduction_kg=co2_reduced,
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
