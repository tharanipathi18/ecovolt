import mongoose from 'mongoose';

/**
 * Fleet schema.
 * Represents a fleet of EVs managed by a fleet manager.
 */
const fleetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Fleet name is required'],
      trim: true,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      trim: true,
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

// Virtual: vehicle count
fleetSchema.virtual('vehicles', {
  ref: 'Vehicle',
  localField: '_id',
  foreignField: 'fleet',
  count: true,
});

// Indexes
fleetSchema.index({ manager: 1 });

const Fleet = mongoose.model('Fleet', fleetSchema);
export default Fleet;
