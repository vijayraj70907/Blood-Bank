const mongoose = require('mongoose');
const User = require('./models/User');
const BloodBank = require('./models/BloodBank');

const seedDB = async () => {
  try {
    // Clear old demo accounts to guarantee correct password hashing on start
    await User.deleteMany({ email: { $in: ['super@bloodbridge.in', 'donor@bloodbridge.in', 'patient@bloodbridge.in', 'admin@bloodbridge.in'] } });
    await BloodBank.deleteMany({ email: 'admin@bloodbridge.in' });

    // 1. Super Admin
    const superAdmin = await User.findOne({ email: 'super@bloodbridge.in' });
    if (!superAdmin) {
      await User.create({
        name: 'Super Admin',
        email: 'super@bloodbridge.in',
        password: 'super123',
        phone: '+91 9876543213',
        role: 'superadmin',
        isVerified: true,
      });
      console.log('🌱 Seeded Super Admin');
    }

    // 2. Donor
    const donor = await User.findOne({ email: 'donor@bloodbridge.in' });
    if (!donor) {
      await User.create({
        name: 'Ravi Kumar',
        email: 'donor@bloodbridge.in',
        password: 'donor123',
        phone: '+91 9876543211',
        role: 'donor',
        bloodGroup: 'B+',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500001',
        isVerified: true,
      });
      console.log('🌱 Seeded Demo Donor');
    }

    // 3. Patient
    const patient = await User.findOne({ email: 'patient@bloodbridge.in' });
    if (!patient) {
      await User.create({
        name: 'Anjali Reddy',
        email: 'patient@bloodbridge.in',
        password: 'patient123',
        phone: '+91 9876543212',
        role: 'patient',
        bloodGroup: 'A+',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500001',
        isVerified: true,
      });
      console.log('🌱 Seeded Demo Patient');
    }

    // 4. Admin (Blood Bank Owner) & Blood Bank
    let adminUser = await User.findOne({ email: 'admin@bloodbridge.in' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Dr. Rajesh Kumar',
        email: 'admin@bloodbridge.in',
        password: 'admin123',
        phone: '+91 9876543210',
        role: 'admin',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500001',
        isVerified: true,
      });
      console.log('🌱 Seeded Demo Admin User');
    }

    let adminBank = await BloodBank.findOne({ email: 'admin@bloodbridge.in' });
    if (!adminBank) {
      adminBank = await BloodBank.create({
        name: 'City Blood Bank',
        licenseNumber: 'LIC-12345-DL',
        governmentRegistrationNumber: 'GOV-REG-992',
        ownerName: 'Dr. Rajesh Kumar',
        owner: adminUser._id,
        email: 'admin@bloodbridge.in',
        phone: '+91 9876543210',
        address: 'A-10 Metro Street',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500001',
        isVerified: true,
        inventory: [
          { group: 'A+', units: 25 }, { group: 'A-', units: 10 },
          { group: 'B+', units: 45 }, { group: 'B-', units: 5 },
          { group: 'AB+', units: 12 }, { group: 'AB-', units: 2 },
          { group: 'O+', units: 60 }, { group: 'O-', units: 15 },
        ],
      });
      console.log('🌱 Seeded Demo Blood Bank');
    }

    if (!adminUser.bloodBankId) {
      adminUser.bloodBankId = adminBank._id;
      await adminUser.save();
    }
  } catch (err) {
    console.error('❌ Database seeding error:', err);
  }
};

module.exports = seedDB;
