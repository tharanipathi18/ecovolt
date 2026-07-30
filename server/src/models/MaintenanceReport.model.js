import mongoose from 'mongoose';

/**
 * Maintenance Report Schema.
 * Records maintenance events and diagnostic issues for ChargingPorts, Vehicles, and EnergyGenerators.
 */
const maintenanceReportSchema = new mongoose.Schema(
  {
    reportType: {
      type: String,
      enum: ['charging_port', 'vehicle', 'generator'],
      required: [true, 'Report target type is required'],
    },
    chargingPort: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChargingPort',
      default: null,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      default: null,
    },
    generator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EnergyGenerator',
      default: null,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter reference is required'],
    },
    technicianAssigned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Report title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Detailed description is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed', 'cancelled'],
      default: 'open',
    },
    estimatedCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    resolutionNotes: {
      type: String,
      default: null,
    },
    resolvedAt: {
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
maintenanceReportSchema.index({ reportType: 1, status: 1 });
maintenanceReportSchema.index({ chargingPort: 1 });
maintenanceReportSchema.index({ vehicle: 1 });
maintenanceReportSchema.index({ generator: 1 });
maintenanceReportSchema.index({ priority: 1 });

const MaintenanceReport = mongoose.model('MaintenanceReport', maintenanceReportSchema);
export default MaintenanceReport;
