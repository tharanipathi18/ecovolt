import mongoose from 'mongoose';

/**
 * Energy Production Log Schema.
 * Records energy production telemetry and manual/automatic energy uploads.
 */
const energyProductionLogSchema = new mongoose.Schema(
  {
    generator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EnergyGenerator',
      required: [true, 'Generator reference is required'],
    },
    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Operator reference is required'],
    },
    energyGeneratedKwh: {
      type: Number,
      required: [true, 'Generated energy in kWh is required'],
      min: [0.01, 'Energy generated must be positive'],
    },
    peakOutputKw: {
      type: Number,
      required: [true, 'Peak output in kW is required'],
      min: 0,
    },
    excessEnergyKwh: {
      type: Number,
      default: 0,
      min: 0,
    },
    revenueEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    logTimestamp: {
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
energyProductionLogSchema.index({ generator: 1, logTimestamp: -1 });
energyProductionLogSchema.index({ operator: 1, logTimestamp: -1 });

const EnergyProductionLog = mongoose.model('EnergyProductionLog', energyProductionLogSchema);
export default EnergyProductionLog;
