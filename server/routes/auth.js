const express = require('express');
const router = express.Router();
const User = require('../models/User');
const BloodBank = require('../models/BloodBank');
const { generateToken, protect } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// ── Register ──
router.post('/register', [
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('role').isIn(['admin', 'donor', 'patient']).withMessage('Valid role is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name, email, password, phone, role,
      bloodGroup, dob, weight, gender, address, city, state, pincode,
      bankName, licenseNumber, governmentRegistrationNumber, ownerName
    } = req.body;

    // Check unique email in User and BloodBank
    const existingUserEmail = await User.findOne({ email });
    if (existingUserEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const existingBankEmail = await BloodBank.findOne({ email });
    if (existingBankEmail) {
      return res.status(400).json({ error: 'Email already registered to a blood bank' });
    }

    // Check unique phone in User and BloodBank
    const existingUserPhone = await User.findOne({ phone });
    if (existingUserPhone) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }
    const existingBankPhone = await BloodBank.findOne({ phone });
    if (existingBankPhone) {
      return res.status(400).json({ error: 'Phone number already registered to a blood bank' });
    }

    let user;
    if (role === 'admin') {
      // Validate blood bank fields
      if (!bankName) return res.status(400).json({ error: 'Blood Bank Name is required' });
      if (!licenseNumber) return res.status(400).json({ error: 'License Number is required' });
      if (!governmentRegistrationNumber) return res.status(400).json({ error: 'Government Registration Number is required' });
      if (!ownerName) return res.status(400).json({ error: 'Owner Name is required' });
      if (!address) return res.status(400).json({ error: 'Address is required' });
      if (!city) return res.status(400).json({ error: 'City is required' });
      if (!state) return res.status(400).json({ error: 'State is required' });
      if (!pincode) return res.status(400).json({ error: 'Pincode is required' });

      // Check unique License Number
      const existingLicense = await BloodBank.findOne({ licenseNumber });
      if (existingLicense) {
        return res.status(400).json({ error: 'License number already registered' });
      }

      // Create owner user
      user = await User.create({
        name, email, password, phone, role,
        address, city, state, pincode,
      });

      // Create BloodBank
      const bank = await BloodBank.create({
        name: bankName,
        licenseNumber,
        governmentRegistrationNumber,
        ownerName,
        owner: user._id,
        email,
        phone,
        address,
        city,
        state,
        pincode,
        inventory: [
          { group: 'A+', units: 0 }, { group: 'A-', units: 0 },
          { group: 'B+', units: 0 }, { group: 'B-', units: 0 },
          { group: 'AB+', units: 0 }, { group: 'AB-', units: 0 },
          { group: 'O+', units: 0 }, { group: 'O-', units: 0 },
        ],
      });

      // Link blood bank to user
      user.bloodBankId = bank._id;
      await user.save();
    } else {
      user = await User.create({
        name, email, password, phone, role,
        bloodGroup, dob, weight, gender, address, city, state, pincode,
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Registration successful',
      user: user.toJSON(),
      token,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ── Login ──
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'No account found with this email address.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Your account has been suspended. Please contact support.' });
    }

    // Update lastLogin without triggering pre-save password hook
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ── Get Current User ──
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ── Update Profile ──
router.put('/profile', protect, async (req, res) => {
  try {
    const updates = {};
    const allowedFields = ['name', 'phone', 'bloodGroup', 'dob', 'weight', 'gender', 'address', 'city', 'state', 'pincode', 'avatar'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ── Forgot Password ──
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail(),
], async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'If the email exists, a reset link has been sent.' });
    }

    const resetToken = Math.random().toString(36).substring(2, 15);
    await User.findByIdAndUpdate(user._id, {
      resetToken,
      resetTokenExpiry: new Date(Date.now() + 3600000),
    });

    // TODO: Send email with reset link
    console.log(`Reset token for ${email}: ${resetToken}`);

    res.json({ message: 'Password reset link sent to your email.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// ── Send OTP ──
router.post('/send-otp', [
  body('phone').notEmpty(),
], async (req, res) => {
  try {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // TODO: Send OTP via Twilio
    console.log(`OTP for ${phone}: ${otp}`);

    res.json({ message: 'OTP sent successfully', otp_preview: process.env.NODE_ENV === 'development' ? otp : undefined });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// ── Change Password ──
router.put('/change-password', protect, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
], async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;
