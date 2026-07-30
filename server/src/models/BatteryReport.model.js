import mongoose from 'mongoose';

/**
 * Battery Report Schema.
 * Tracks EV battery health, State of Charge (SoC), degradation, temperature, and charging cycle metrics.
 */
const batteryReportSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle reference is required'],
    },
    stateOfHealthPercentage: {
      type: Number, // Battery SOH (e.g., 94.5%)
      required: [true, 'State of Health (SoH) percentage is required'],
      min: 0,
      max: 100,
    },
    stateOfChargePercentage: {
      type: Number, // Current SoC (0-100%)
      required: true,
      min: 0,
      max: 100,
    },
    batteryTemperatureCelsius: {
      type: Number,
      required: true,
    },
    voltage: {
      type: Number, // Volts
      min: 0,
    },
    currentAmperes: {
      type: Number, // Amps
    },
    totalChargeCycles: {
      type: Number,
      default: 0,
      min: 0,
    },
    fastChargeCycles: {
      type: Number,
      default: 0,
      min: 0,
    },
    healthStatus: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'degraded', 'critical'],
      default: 'good',
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Indexes ──────────────────────────────────────────────────────
batteryReportSchema.index({ vehicle: 1, reportedAt: -1 });
batteryReportSchema.index({ healthStatus: 1 });

const BatteryReport = mongoose.model('BatteryReport', batteryReportSchema);
export default BatteryReport;
