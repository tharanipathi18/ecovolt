import mongoose from 'mongoose';

/**
 * Charging Session Schema.
 * Represents an EV charging session at a specific ChargingPort.
 */
const chargingSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    chargingPort: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChargingPort',
      required: [true, 'Charging port reference is required'],
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle reference is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled', 'failed'],
      default: 'pending',
    },
    startStateOfCharge: {
      type: Number, // %
      min: 0,
      max: 100,
    },
    endStateOfCharge: {
      type: Number, // %
      min: 0,
      max: 100,
    },
    energyConsumedKwh: {
      type: Number,
      default: 0,
      min: 0,
    },
    peakPowerKw: {
      type: Number,
      default: 0,
      min: 0,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    cost: {
      amount: { type: Number, default: 0, min: 0 },
      currency: { type: String, default: 'USD' },
    },
    renewableEnergyPercentage: {
      type: Number, // Percentage 0-100% matched from green generators
      default: 0,
      min: 0,
      max: 100,
    },
    linkedEnergyTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EnergyTransaction',
      default: null,
    },
    linkedPayment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Indexes ──────────────────────────────────────────────────────
chargingSessionSchema.index({ user: 1, status: 1 });
chargingSessionSchema.index({ chargingPort: 1, status: 1 });
chargingSessionSchema.index({ vehicle: 1 });
chargingSessionSchema.index({ startTime: -1 });

// ─── Virtual: Duration in minutes ──────────────────────────────────
chargingSessionSchema.virtual('durationMinutes').get(function () {
  if (this.startTime && this.endTime) {
    return Math.round((this.endTime.getTime() - this.startTime.getTime()) / 60000);
  }
  return null;
});

const ChargingSession = mongoose.model('ChargingSession', chargingSessionSchema);
export default ChargingSession;
