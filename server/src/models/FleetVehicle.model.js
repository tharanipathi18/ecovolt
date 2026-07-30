import mongoose from 'mongoose';

/**
 * FleetVehicle Schema.
 * Represents fleet units managed by Fleet Managers, associating vehicles with drivers and schedule priorities.
 */
const fleetVehicleSchema = new mongoose.Schema(
  {
    fleetName: {
      type: String,
      required: [true, 'Fleet name is required'],
      trim: true,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Fleet manager reference is required'],
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle reference is required'],
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },
    fleetUnitNumber: {
      type: String,
      required: [true, 'Fleet unit number (e.g. FLEET-UNIT-04) is required'],
      trim: true,
    },
    chargingPriority: {
      type: String,
      enum: ['high', 'medium', 'low', 'scheduled_window'],
      default: 'medium',
    },
    preferredChargeStartTime: {
      type: String, // HH:mm format
      default: '22:00',
    },
    targetStateOfCharge: {
      type: Number,
      default: 90,
      min: 20,
      max: 100,
    },
    status: {
      type: String,
      enum: ['active', 'in_transit', 'charging', 'maintenance', 'decommissioned'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Indexes ──────────────────────────────────────────────────────
fleetVehicleSchema.index({ manager: 1, status: 1 });
fleetVehicleSchema.index({ vehicle: 1 }, { unique: true });
fleetVehicleSchema.index({ assignedDriver: 1 });

const FleetVehicle = mongoose.model('FleetVehicle', fleetVehicleSchema);
export default FleetVehicle;
