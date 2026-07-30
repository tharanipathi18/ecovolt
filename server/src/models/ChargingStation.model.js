import mongoose from 'mongoose';

/**
 * Charging Station schema.
 * Represents a physical EV charging station with multiple ports.
 */
const chargingStationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Station name is required'],
      trim: true,
    },
    location: {
      address: { type: String, required: true },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    ports: [
      {
        portNumber: { type: Number, required: true },
        connectorType: {
          type: String,
          enum: ['type_1', 'type_2', 'ccs_1', 'ccs_2', 'chademo', 'tesla'],
          required: true,
        },
        powerOutput: {
          type: Number,
          required: true,
          min: 0,
        },
        status: {
          type: String,
          enum: ['available', 'occupied', 'maintenance', 'offline', 'reserved'],
          default: 'available',
        },
      },
    ],
    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    energySources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EnergyGenerator',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    pricing: {
      ratePerKwh: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes
chargingStationSchema.index({ 'location.coordinates.lat': 1, 'location.coordinates.lng': 1 });
chargingStationSchema.index({ isActive: 1 });

const ChargingStation = mongoose.model('ChargingStation', chargingStationSchema);
export default ChargingStation;
