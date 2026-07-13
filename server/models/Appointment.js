const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bloodBank: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodBank', required: true },
  date: { type: Date, required: true },
  timeSlot: String,
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'], default: 'pending' },
  bloodGroup: String,
  notes: String,
  confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  certificate: String,
  units: { type: Number, default: 1 },
  points: { type: Number, default: 100 },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
