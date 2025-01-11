import mongoose,{Schema} from 'mongoose';


const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g., "Added Employee", "Updated Status"
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  details: { type: Object, required: true }, // Store additional details about the action
  timestamp: { type: Date, default: Date.now },
});

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
