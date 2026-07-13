const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const BloodRequest = require('../models/BloodRequest');
const { protect, authorize } = require('../middleware/auth');

// ── Get donor profile ──
router.get('/profile', protect, authorize('donor'), async (req, res) => {
  try {
    const donor = await User.findById(req.user._id);
    const appointments = await Appointment.find({ donor: req.user._id })
      .populate('bloodBank', 'name address city')
      .sort('-date')
      .limit(10);

    const totalDonations = await Appointment.countDocuments({
      donor: req.user._id,
      status: 'completed',
    });

    res.json({
      donor,
      appointments,
      totalDonations,
      totalPoints: totalDonations * 100,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch donor profile' });
  }
});

// ── Check eligibility ──
router.post('/eligibility', protect, authorize('donor'), async (req, res) => {
  try {
    const { age, weight, lastDonationDate, hemoglobin, chronicDisease, recentSurgery, medication } = req.body;

    const checks = [];
    let eligible = true;

    // Age check
    const ageOk = age >= 18 && age <= 65;
    checks.push({ label: 'Age (18-65)', pass: ageOk, detail: `Age: ${age}` });
    if (!ageOk) eligible = false;

    // Weight check
    const weightOk = weight >= 50;
    checks.push({ label: 'Weight (≥50 kg)', pass: weightOk, detail: `Weight: ${weight} kg` });
    if (!weightOk) eligible = false;

    // Last donation check
    if (lastDonationDate) {
      const daysSince = Math.floor((Date.now() - new Date(lastDonationDate)) / (86400000));
      const donationOk = daysSince >= 90;
      checks.push({ label: 'Last donation (90+ days)', pass: donationOk, detail: `${daysSince} days ago` });
      if (!donationOk) eligible = false;
    }

    // Hemoglobin
    if (hemoglobin) {
      const hbOk = hemoglobin >= 12.5;
      checks.push({ label: 'Hemoglobin (≥12.5 g/dL)', pass: hbOk, detail: `Hb: ${hemoglobin}` });
      if (!hbOk) eligible = false;
    }

    // Health checks
    if (chronicDisease) { checks.push({ label: 'No chronic disease', pass: false, detail: 'Chronic condition' }); eligible = false; }
    if (recentSurgery) { checks.push({ label: 'No recent surgery', pass: false, detail: 'Recent surgery' }); eligible = false; }
    if (medication) { checks.push({ label: 'No restricted medication', pass: false, detail: 'On medication' }); eligible = false; }

    res.json({ eligible, checks });
  } catch (err) {
    res.status(500).json({ error: 'Eligibility check failed' });
  }
});

// ── Book appointment ──
router.post('/appointment', protect, authorize('donor'), async (req, res) => {
  try {
    const { bloodBankId, date, timeSlot, notes } = req.body;

    const appointment = await Appointment.create({
      donor: req.user._id,
      bloodBank: bloodBankId,
      date,
      timeSlot,
      notes,
      bloodGroup: req.user.bloodGroup,
    });

    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to book appointment' });
  }
});

// ── Get donation history ──
router.get('/history', protect, authorize('donor'), async (req, res) => {
  try {
    const history = await Appointment.find({
      donor: req.user._id,
      status: 'completed',
    })
      .populate('bloodBank', 'name address city')
      .sort('-date');

    res.json({ history, total: history.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// ── Get rewards ──
router.get('/rewards', protect, authorize('donor'), async (req, res) => {
  try {
    const totalDonations = await Appointment.countDocuments({
      donor: req.user._id,
      status: 'completed',
    });

    const totalPoints = totalDonations * 100;
    const tiers = [
      { name: 'Bronze', min: 1, icon: '🥉' },
      { name: 'Silver', min: 5, icon: '🥈' },
      { name: 'Gold', min: 10, icon: '🥇' },
      { name: 'Platinum', min: 20, icon: '💎' },
    ];

    const currentTier = tiers.filter(t => totalDonations >= t.min).pop() || tiers[0];
    const nextTier = tiers.find(t => t.min > totalDonations);

    res.json({
      totalDonations,
      totalPoints,
      currentTier,
      nextTier,
      tiers,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rewards' });
  }
});

// ── Get appointments ──
router.get('/appointments', protect, authorize('donor'), async (req, res) => {
  try {
    const appointments = await Appointment.find({ donor: req.user._id })
      .populate('bloodBank', 'name address city phone')
      .sort('-date');
    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// ── Cancel appointment ──
router.put('/appointment/:id/cancel', protect, authorize('donor'), async (req, res) => {
  try {
    const apt = await Appointment.findOne({ _id: req.params.id, donor: req.user._id });
    if (!apt) return res.status(404).json({ error: 'Appointment not found' });
    if (apt.status === 'completed') return res.status(400).json({ error: 'Cannot cancel completed appointment' });

    apt.status = 'cancelled';
    await apt.save();
    res.json({ message: 'Appointment cancelled', appointment: apt });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

// ── Update Donor Availability ──
router.put('/availability', protect, authorize('donor'), async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const updated = await User.findByIdAndUpdate(req.user._id, { isAvailable: !!isAvailable }, { new: true });
    res.json({ message: 'Availability updated successfully', isAvailable: updated.isAvailable });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// ── Accept Emergency Request ──
router.put('/request/:id/accept', protect, authorize('donor'), async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Blood request not found' });
    
    request.status = 'accepted';
    request.donor = req.user._id;
    await request.save();

    res.json({ message: 'Emergency request accepted successfully', request });
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept request' });
  }
});

// ── Update Donor Profile (Blood Group and Location) ──
router.put('/update-profile', protect, authorize('donor'), async (req, res) => {
  try {
    const { bloodGroup, address, city, state, pincode } = req.body;
    const updates = {};
    if (bloodGroup) updates.bloodGroup = bloodGroup;
    if (address) updates.address = address;
    if (city) updates.city = city;
    if (state) updates.state = state;
    if (pincode) updates.pincode = pincode;

    const donor = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ message: 'Profile updated successfully', donor });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ── Get pending emergency requests for donor's city and blood group ──
router.get('/requests', protect, authorize('donor'), async (req, res) => {
  try {
    const requests = await BloodRequest.find({
      bloodGroup: req.user.bloodGroup,
      city: new RegExp(req.user.city, 'i'),
      isEmergency: true,
      status: 'pending',
    }).populate('patient', 'name phone');
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch emergency requests' });
  }
});

module.exports = router;
