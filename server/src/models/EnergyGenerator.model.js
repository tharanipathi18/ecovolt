import mongoose from 'mongoose';

/**
 * Energy Generator Schema.
 * Represents renewable energy generation facilities (solar, wind, hydro, biomass, geothermal).
 */
const energyGeneratorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Generator name is required'],
      trim: true,
      maxlength: [120, 'Generator name cannot exceed 120 characters'],
    },
    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Operator user reference is required'],
    },
    type: {
      type: String,
      enum: {
        values: ['solar', 'wind', 'hydro', 'biomass', 'geothermal'],
        message: '{VALUE} is not a valid energy source type',
      },
      required: [true, 'Energy source type is required'],
    },
    capacityKw: {
      type: Number,
      required: [true, 'Rated capacity in kW is required'],
      min: [0.1, 'Capacity must be greater than 0'],
    },
    currentOutputKw: {
      type: Number,
      default: 0,
      min: [0, 'Current output cannot be negative'],
    },
    excessEnergyKw: {
      type: Number,
      default: 0,
      min: [0, 'Excess energy cannot be negative'],
    },
    tariffRatePerKwh: {
      type: Number,
      default: 0.15, // $0.15 per kWh default
      min: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: String,
      country: { type: String, default: 'USA' },
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true,
        },
      },
    },
    gridConnection: {
      type: String,
      enum: ['grid', 'microgrid', 'hybrid'],
      default: 'grid',
    },
    microgridNodeId: {
      type: String,
      trim: true,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance', 'faulted'],
      default: 'active',
    },
    efficiencyRating: {
      type: Number, // Percentage 0-100
      default: 95,
      min: 0,
      max: 100,
    },
    totalEnergyGeneratedKwh: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Indexes ──────────────────────────────────────────────────────
energyGeneratorSchema.index({ 'location.coordinates': '2dsphere' });
energyGeneratorSchema.index({ operator: 1, status: 1 });
energyGeneratorSchema.index({ type: 1, status: 1 });
energyGeneratorSchema.index({ microgridNodeId: 1 });

// ─── Virtual Populates ────────────────────────────────────────────
energyGeneratorSchema.virtual('energyTransactions', {
  ref: 'EnergyTransaction',
  localField: '_id',
  foreignField: 'generator',
});

energyGeneratorSchema.virtual('productionLogs', {
  ref: 'EnergyProductionLog',
  localField: '_id',
  foreignField: 'generator',
});

const EnergyGenerator = mongoose.model('EnergyGenerator', energyGeneratorSchema);
export default EnergyGenerator;
