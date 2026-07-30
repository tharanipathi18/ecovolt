import mongoose from 'mongoose';

/**
 * Payment Schema.
 * Tracks monetary settlements for charging sessions and clean energy credits.
 */
const paymentSchema = new mongoose.Schema(
  {
    transactionId: {
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
    chargingSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChargingSession',
      default: null,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0.01, 'Amount must be positive'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'stripe', 'wallet', 'crypto', 'invoice'],
      required: [true, 'Payment method is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    receiptUrl: {
      type: String,
      default: null,
    },
    paidAt: {
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
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ chargingSession: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
