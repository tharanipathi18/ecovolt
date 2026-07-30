import mongoose from 'mongoose';

/**
 * Booking Schema.
 * Represents an EV user's advance slot reservation at a charging port.
 */
const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
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
    scheduledStartTime: {
      type: Date,
      required: [true, 'Scheduled start time is required'],
    },
    durationMinutes: {
      type: Number,
      default: 45,
      min: 15,
      max: 240,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
      default: 'confirmed',
    },
    estimatedCost: {
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
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ chargingPort: 1, scheduledStartTime: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
