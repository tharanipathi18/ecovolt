import mongoose from 'mongoose';

/**
 * Driver Schema.
 * Represents commercial or registered drivers associated with accounts and fleet vehicles.
 */
const driverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User account reference is required'],
      unique: true,
    },
    licenseNumber: {
      type: String,
      required: [true, 'Driver license number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    licenseExpirationDate: {
      type: Date,
      required: [true, 'License expiration date is required'],
    },
    assignedFleetVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FleetVehicle',
      default: null,
    },
    employerManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    drivingRating: {
      type: Number, // 1.0 to 5.0
      default: 5.0,
      min: 1.0,
      max: 5.0,
    },
    status: {
      type: String,
      enum: ['available', 'on_duty', 'off_duty', 'suspended'],
      default: 'available',
    },
    ecoScore: {
      type: Number, // Eco driving score (0-100)
      default: 85,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Indexes ──────────────────────────────────────────────────────
driverSchema.index({ user: 1 });
driverSchema.index({ licenseNumber: 1 });
driverSchema.index({ employerManager: 1, status: 1 });

const Driver = mongoose.model('Driver', driverSchema);
export default Driver;
