const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  email: String,
  password: { type: String, select: false },
  role: String,
  isActive: { type: Boolean, default: true },
  isVerified: Boolean,
});
const User = mongoose.model('User', userSchema);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bloodbridge').then(async () => {
  console.log('✅ Connected to DB');
  const emails = ['donor@bloodbridge.in', 'patient@bloodbridge.in', 'admin@bloodbridge.in', 'super@bloodbridge.in'];
  const users = await User.find({ email: { $in: emails } }).select('+password');

  console.log(`\nFound ${users.length} demo users:\n`);
  for (const u of users) {
    const passwords = { donor: 'donor123', patient: 'patient123', admin: 'admin123', superadmin: 'super123' };
    const pwd = passwords[u.role] || '';
    const match = u.password ? await bcrypt.compare(pwd, u.password) : false;
    console.log(`Email: ${u.email}`);
    console.log(`  Role: ${u.role}`);
    console.log(`  Password hash: ${u.password ? u.password.substring(0, 25) + '...' : 'MISSING!'}`);
    console.log(`  Password match (${pwd}): ${match}`);
    console.log(`  isActive: ${u.isActive}`);
    console.log(`  isVerified: ${u.isVerified}`);
    console.log('');
  }

  if (users.length < 4) {
    console.log('⚠️  Some demo users are missing from DB!');
  }

  await mongoose.disconnect();
  process.exit(0);
}).catch(err => {
  console.error('DB Error:', err.message);
  process.exit(1);
});
