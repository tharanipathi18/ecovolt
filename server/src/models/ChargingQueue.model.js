import mongoose from 'mongoose';

/**
 * Charging Queue Schema.
 * Represents EVs in the waiting queue for an available charging port.
 */
const chargingQueueSchema = new mongoose.Schema(
  {
    chargingPort: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChargingPort',
      required: [true, 'Charging port reference is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Vehicle reference is required'],
    },
    position: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['waiting', 'called', 'charging', 'cancelled', 'expired'],
      default: 'waiting',
    },
    estimatedWaitTimeMinutes: {
      type: Number,
      default: 15,
      min: 0,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    calledAt: {
      type: Date,
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
chargingQueueSchema.index({ chargingPort: 1, position: 1 });
chargingQueueSchema.index({ user: 1, status: 1 });

const ChargingQueue = mongoose.model('ChargingQueue', chargingQueueSchema);
export default ChargingQueue;
