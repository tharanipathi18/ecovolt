import mongoose from 'mongoose';

/**
 * Demand Prediction Schema.
 * Stores AI microservice forecasts for EV charging demand and renewable energy generation curves.
 */
const demandPredictionSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ['microgrid_node', 'charging_port', 'generator', 'region'],
      required: [true, 'Target type for prediction is required'],
    },
    microgridNodeId: {
      type: String,
      trim: true,
      default: null,
    },
    chargingPort: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChargingPort',
      default: null,
    },
    generator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EnergyGenerator',
      default: null,
    },
    forecastWindowStart: {
      type: Date,
      required: [true, 'Forecast window start time is required'],
    },
    forecastWindowEnd: {
      type: Date,
      required: [true, 'Forecast window end time is required'],
    },
    predictedDemandKw: {
      type: Number,
      required: true,
      min: 0,
    },
    predictedSupplyKw: {
      type: Number,
      required: true,
      min: 0,
    },
    confidenceScorePercentage: {
      type: Number, // 0-100% confidence from XGBoost / scikit-learn model
      default: 90,
      min: 0,
      max: 100,
    },
    recommendedAction: {
      type: String,
      enum: ['increase_generation', 'throttle_non_essential', 'buffer_battery', 'optimal_balance', 'shift_fleet_charge'],
      default: 'optimal_balance',
    },
    aiModelVersion: {
      type: String,
      default: 'v1.0.0-xgboost',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Indexes ──────────────────────────────────────────────────────
demandPredictionSchema.index({ targetType: 1, forecastWindowStart: 1 });
demandPredictionSchema.index({ microgridNodeId: 1, forecastWindowStart: -1 });
demandPredictionSchema.index({ chargingPort: 1 });
demandPredictionSchema.index({ generator: 1 });

const DemandPrediction = mongoose.model('DemandPrediction', demandPredictionSchema);
export default DemandPrediction;
