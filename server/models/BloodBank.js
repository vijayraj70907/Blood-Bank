const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  group: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
  units: { type: Number, default: 0, min: 0 },
  expiryDate: Date,
  collectionDate: Date,
  storageLocation: String,
  status: { type: String, enum: ['available', 'low', 'critical', 'expired'], default: 'available' },
  lastUpdated: { type: Date, default: Date.now },
});

const bloodBankSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  licenseNumber: { type: String, required: true, unique: true, trim: true },
  governmentRegistrationNumber: { type: String, required: true, trim: true },
  ownerName: { type: String, required: true, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  district: String,
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [78.4867, 17.3850] }, // [lng, lat]
  },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  openingHours: String,
  closingHours: String,
  isOpen24x7: { type: Boolean, default: false },
  inventory: [inventoryItemSchema],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalDonors: { type: Number, default: 0 },
  totalDonations: { type: Number, default: 0 },
}, { timestamps: true });

bloodBankSchema.index({ location: '2dsphere' });

// Get total available units
bloodBankSchema.virtual('totalUnits').get(function () {
  return this.inventory.reduce((sum, item) => sum + item.units, 0);
});

// Get stock for a specific group
bloodBankSchema.methods.getStock = function (group) {
  const item = this.inventory.find(i => i.group === group);
  return item ? item.units : 0;
};

module.exports = mongoose.model('BloodBank', bloodBankSchema);
