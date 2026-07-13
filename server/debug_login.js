require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Inline the schema to match exactly what the server uses
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  phone: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'admin', 'donor', 'patient'], required: true },
  avatar: { type: String },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isAvailable: { type: Boolean, default: true },
  lastLogin: { type: Date },
  bloodGroup: { type: String },
  dob: Date,
  weight: Number,
  gender: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  bloodBankId: mongoose.Schema.Types.ObjectId,
  resetToken: String,
  resetTokenExpiry: Date,
}, { timestamps: true });

// Replicate pre-save hook exactly
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('UserTest', userSchema, 'users'); // Use 'users' collection

async function testLogin(email, password, role) {
  console.log(`\n--- Testing login: ${email} / ${password} / role=${role} ---`);
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('❌ User NOT FOUND in DB');
      return;
    }
    console.log('✅ User found:', user.email, '| DB role:', user.role, '| isActive:', user.isActive);
    
    if (role && user.role !== role) {
      console.log(`❌ Role mismatch: DB has "${user.role}" but login sent "${role}"`);
      return;
    }
    
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Password does not match!');
      return;
    }
    
    if (!user.isActive) {
      console.log('❌ Account is suspended');
      return;
    }
    
    // Test user.save() to see if it errors
    console.log('Testing user.save() with lastLogin update...');
    try {
      user.lastLogin = new Date();
      await user.save();
      console.log('✅ user.save() succeeded');
    } catch (saveErr) {
      console.log('❌ user.save() FAILED:', saveErr.message);
      console.log('   This is the bug causing 500 on login!');
    }
    
    console.log('✅ Login would succeed!');
  } catch (err) {
    console.log('❌ Error during test:', err.message);
  }
}

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bloodbridge').then(async () => {
  console.log('Connected to DB');
  
  await testLogin('donor@bloodbridge.in', 'donor123', 'donor');
  await testLogin('patient@bloodbridge.in', 'patient123', 'patient');
  await testLogin('admin@bloodbridge.in', 'admin123', 'admin');
  await testLogin('super@bloodbridge.in', 'super123', 'superadmin');
  
  await mongoose.disconnect();
  process.exit(0);
}).catch(err => {
  console.error('DB Error:', err.message);
  process.exit(1);
});
