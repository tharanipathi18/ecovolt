import mongoose from 'mongoose';

/**
 * Charging Port Schema.
 * Represents an individual physical EV charging port / station connector.
 */
const chargingPortSchema = new mongoose.Schema(
  {
    stationName: {
      type: String,
      required: [true, 'Station name is required'],
      trim: true,
    },
    portIdentifier: {
      type: String,
      required: [true, 'Port identifier (e.g. PORT-01) is required'],
      trim: true,
    },
    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Operator reference is required'],
    },
    connectorType: {
      type: String,
      enum: {
        values: ['type_1', 'type_2', 'ccs_1', 'ccs_2', 'chademo', 'tesla'],
        message: '{VALUE} is not a valid connector type',
      },
      required: [true, 'Connector type is required'],
    },
    maxPowerOutputKw: {
      type: Number,
      required: [true, 'Max power output in kW is required'],
      min: [1, 'Power output must be positive'],
    },
    currentPowerOutputKw: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'maintenance', 'offline', 'reserved'],
      default: 'available',
    },
    pricing: {
      ratePerKwh: {
        type: Number,
        required: [true, 'Rate per kWh is required'],
        min: 0,
      },
      currency: {
        type: String,
        default: 'USD',
      },
      idleFeePerMinute: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: String,
      zipCode: String,
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
    linkedGenerators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EnergyGenerator',
      },
    ],
    microgridNodeId: {
      type: String,
      trim: true,
      default: null,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Indexes ──────────────────────────────────────────────────────
chargingPortSchema.index({ 'location.coordinates': '2dsphere' });
chargingPortSchema.index({ operator: 1, status: 1 });
chargingPortSchema.index({ connectorType: 1, status: 1 });
chargingPortSchema.index({ stationName: 1, portIdentifier: 1 }, { unique: true });

// ─── Virtual Populates ────────────────────────────────────────────
chargingPortSchema.virtual('activeSessions', {
  ref: 'ChargingSession',
  localField: '_id',
  foreignField: 'chargingPort',
  match: { status: 'active' },
});

chargingPortSchema.virtual('maintenanceReports', {
  ref: 'MaintenanceReport',
  localField: '_id',
  foreignField: 'chargingPort',
});

const ChargingPort = mongoose.model('ChargingPort', chargingPortSchema);
export default ChargingPort;
