import mongoose from 'mongoose';

/**
 * Energy Transaction Schema.
 * Coordinates renewable energy supply credit/dispatch allocation between generators, ports, and microgrids.
 * Note: EcoVolt coordinates energy availability through existing grid/microgrids; it does not physically transfer electricity.
 */
const energyTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    generator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EnergyGenerator',
      required: [true, 'Generator reference is required'],
    },
    chargingPort: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChargingPort',
      required: [true, 'Charging port reference is required'],
    },
    chargingSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChargingSession',
      default: null,
    },
    energyAmountKwh: {
      type: Number,
      required: [true, 'Energy amount in kWh is required'],
      min: [0.01, 'Energy amount must be positive'],
    },
    ratePerKwh: {
      type: Number,
      required: true,
      min: 0,
    },
    totalCost: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    energySourceType: {
      type: String,
      enum: ['solar', 'wind', 'hydro', 'biomass', 'geothermal'],
      required: true,
    },
    microgridNodeId: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ['allocated', 'dispatched', 'settled', 'cancelled'],
      default: 'allocated',
    },
    timestamp: {
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
energyTransactionSchema.index({ transactionId: 1 });
energyTransactionSchema.index({ generator: 1, timestamp: -1 });
energyTransactionSchema.index({ chargingPort: 1, timestamp: -1 });
energyTransactionSchema.index({ chargingSession: 1 });
energyTransactionSchema.index({ status: 1 });

const EnergyTransaction = mongoose.model('EnergyTransaction', energyTransactionSchema);
export default EnergyTransaction;
