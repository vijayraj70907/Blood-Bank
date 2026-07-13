const express = require('express');
const router = express.Router();
const User = require('../models/User');
const BloodBank = require('../models/BloodBank');
const BloodRequest = require('../models/BloodRequest');
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/auth');

// ── Global dashboard ──
router.get('/dashboard', protect, authorize('superadmin'), async (req, res) => {
  try {
    const totalBloodBanks = await BloodBank.countDocuments();
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalRequests = await BloodRequest.countDocuments();
    const totalDonations = await Appointment.countDocuments({ status: 'completed' });
    const pendingBanks = await BloodBank.countDocuments({ isVerified: false });

    const banks = await BloodBank.find().select('name city state totalDonors inventory isVerified').limit(20);

    res.json({
      stats: { totalBloodBanks, totalDonors, totalPatients, totalRequests, totalDonations, pendingBanks },
      banks,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

// ── Manage blood banks ──
router.get('/bloodbanks', protect, authorize('superadmin'), async (req, res) => {
  try {
    const banks = await BloodBank.find().populate('owner', 'name email').sort('-createdAt');
    res.json({ banks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blood banks' });
  }
});

router.put('/bloodbank/:id', protect, authorize('superadmin'), async (req, res) => {
  try {
    const { isVerified, isActive } = req.body;
    const bank = await BloodBank.findByIdAndUpdate(req.params.id, { isVerified, isActive }, { new: true });
    res.json({ message: 'Blood bank updated', bank });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update blood bank' });
  }
});

router.delete('/bloodbank/:id', protect, authorize('superadmin'), async (req, res) => {
  try {
    await BloodBank.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blood bank deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete blood bank' });
  }
});

// ── Manage users ──
router.get('/users', protect, authorize('superadmin'), async (req, res) => {
  try {
    const { role, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (role) filter.role = role;

    const users = await User.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort('-createdAt');
    const total = await User.countDocuments(filter);

    res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.put('/user/:id', protect, authorize('superadmin'), async (req, res) => {
  try {
    const { isActive, role, isVerified } = req.body;
    const updates = {};
    if (isActive !== undefined) updates.isActive = isActive;
    if (role) updates.role = role;
    if (isVerified !== undefined) updates.isVerified = isVerified;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ message: 'User updated', user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/user/:id', protect, authorize('superadmin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ── All requests ──
router.get('/requests', protect, authorize('superadmin'), async (req, res) => {
  try {
    const requests = await BloodRequest.find()
      .populate('patient', 'name email')
      .populate('bloodBank', 'name city')
      .sort('-createdAt')
      .limit(100);
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// ── System settings ──
router.get('/settings', protect, authorize('superadmin'), async (req, res) => {
  res.json({
    settings: {
      siteName: 'BloodBridge',
      supportEmail: 'info@bloodbridge.in',
      helpline: '1800-180-0099',
      version: '1.0.0',
    },
  });
});

module.exports = router;
