import mongoose from 'mongoose';

/**
 * Vehicle Schema.
 * Represents electric vehicles registered on the platform by EV users or fleet managers.
 */
const vehicleSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Vehicle owner is required'],
    },
    make: {
      type: String,
      required: [true, 'Vehicle make (e.g. Tesla, Nissan, Rivian) is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Vehicle model (e.g. Model 3, Leaf) is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Manufacturing year is required'],
      min: [2010, 'Year must be 2010 or later'],
    },
    licensePlate: {
      type: String,
      required: [true, 'License plate is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    vin: {
      type: String,
      uppercase: true,
      trim: true,
      default: null,
    },
    batteryCapacityKwh: {
      type: Number,
      required: [true, 'Battery capacity in kWh is required'],
      min: [1, 'Battery capacity must be greater than 0'],
    },
    currentStateOfCharge: {
      type: Number, // Percentage 0-100%
      default: 50,
      min: 0,
      max: 100,
    },
    connectorType: {
      type: String,
      enum: ['type_1', 'type_2', 'ccs_1', 'ccs_2', 'chademo', 'tesla'],
      required: [true, 'Connector type is required'],
    },
    fleetVehicleRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FleetVehicle',
      default: null,
    },
    isActive: {
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
vehicleSchema.index({ owner: 1 });
vehicleSchema.index({ licensePlate: 1 });
vehicleSchema.index({ fleetVehicleRef: 1 });

// ─── Virtual Populates ────────────────────────────────────────────
vehicleSchema.virtual('chargingSessions', {
  ref: 'ChargingSession',
  localField: '_id',
  foreignField: 'vehicle',
});

vehicleSchema.virtual('batteryReports', {
  ref: 'BatteryReport',
  localField: '_id',
  foreignField: 'vehicle',
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
