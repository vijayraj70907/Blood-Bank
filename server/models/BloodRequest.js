const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
  units: { type: Number, required: true, min: 1 },
  patientName: { type: String, required: true },
  hospital: { type: String, required: true },
  hospitalAddress: String,
  city: String,
  contactPhone: String,
  attenderName: String,
  requiredBefore: Date,
  doctorName: String,
  prescription: String,
  notes: String,
  emergencyLevel: { type: String, enum: ['Critical', 'High', 'Normal', 'Medium', 'Low'], default: 'Normal' },
  isEmergency: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'accepted', 'blood arranged', 'completed', 'approved', 'rejected'], default: 'pending' },
  bloodBank: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodBank' },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  processedAt: Date,
  completedAt: Date,
  rejectionReason: String,
}, { timestamps: true });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
