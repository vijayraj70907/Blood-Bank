const express = require('express');
const router = express.Router();
const BloodRequest = require('../models/BloodRequest');
const BloodBank = require('../models/BloodBank');
const User = require('../models/User');
const notificationRoutes = require('./notifications');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');

// ── File upload (prescriptions) ──
const upload = multer({
  dest: 'uploads/prescriptions/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG, PNG, and PDF files are allowed'), false);
  },
});

// ── Search blood availability ──
router.get('/search', async (req, res) => {
  try {
    const { group, city, state, pincode } = req.query;
    const filter = { isActive: true };
    if (city) filter.city = new RegExp(city, 'i');
    if (state) filter.state = new RegExp(state, 'i');
    if (pincode) filter.pincode = pincode;

    const banks = await BloodBank.find(filter).select('name address city state phone inventory isOpen24x7 location');

    const results = banks.map(bank => {
      const stockItem = group ? bank.inventory.find(i => i.group === group) : null;
      return {
        id: bank._id,
        name: bank.name,
        address: bank.address,
        city: bank.city,
        state: bank.state,
        phone: bank.phone,
        isOpen24x7: bank.isOpen24x7,
        stock: group ? { group, units: stockItem?.units || 0, status: stockItem?.status || 'empty' } : bank.inventory.map(i => ({ group: i.group, units: i.units, status: i.status })),
        available: group ? (stockItem?.units || 0) > 0 : true,
      };
    }).filter(r => !group || r.available);

    res.json({ results, total: results.length });
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// ── Submit blood request ──
router.post('/request', protect, authorize('patient'), upload.single('prescription'), async (req, res) => {
  try {
    const { bloodGroup, units, patientName, hospital, doctorName, contactPhone, emergencyLevel, isEmergency, notes } = req.body;

    const request = await BloodRequest.create({
      patient: req.user._id,
      bloodGroup,
      units: parseInt(units),
      patientName,
      hospital,
      doctorName,
      contactPhone,
      prescription: req.file?.path,
      emergencyLevel: emergencyLevel || (isEmergency ? 'Critical' : 'Medium'),
      isEmergency: isEmergency === 'true' || isEmergency === true,
      notes,
    });

    // TODO: Send notifications to nearby blood banks
    res.status(201).json({ message: 'Blood request submitted successfully', request });
  } catch (err) {
    console.error('Request error:', err);
    res.status(500).json({ error: 'Failed to submit blood request' });
  }
});

// ── Emergency request ──
router.post('/emergency', protect, authorize('patient'), async (req, res) => {
  try {
    const {
      patientName, bloodGroup, units, hospital, hospitalAddress,
      city, contactPhone, attenderName, requiredBefore, emergencyLevel
    } = req.body;

    if (!patientName) return res.status(400).json({ error: 'Patient Name is required' });
    if (!bloodGroup) return res.status(400).json({ error: 'Blood Group is required' });
    if (!units) return res.status(400).json({ error: 'Units Required is required' });
    if (!hospital) return res.status(400).json({ error: 'Hospital Name is required' });
    if (!hospitalAddress) return res.status(400).json({ error: 'Hospital Address is required' });
    if (!city) return res.status(400).json({ error: 'City is required' });
    if (!contactPhone) return res.status(400).json({ error: 'Contact Number is required' });
    if (!attenderName) return res.status(400).json({ error: 'Attender Name is required' });
    if (!requiredBefore) return res.status(400).json({ error: 'Required Before date and time is required' });
    if (!emergencyLevel) return res.status(400).json({ error: 'Emergency Level is required' });

    const request = await BloodRequest.create({
      patient: req.user._id,
      patientName,
      bloodGroup,
      units: parseInt(units),
      hospital,
      hospitalAddress,
      city,
      contactPhone,
      attenderName,
      requiredBefore: new Date(requiredBefore),
      emergencyLevel,
      isEmergency: true,
      status: 'pending',
    });

    // Notify nearby blood banks
    const nearbyBanks = await BloodBank.find({ city: new RegExp(city, 'i') });
    for (const bank of nearbyBanks) {
      if (notificationRoutes.addNotification) {
        notificationRoutes.addNotification({
          userId: bank.owner,
          type: 'emergency',
          title: '🚨 Emergency Blood Request',
          message: `Urgently need ${units} units of ${bloodGroup} at ${hospital}. Address: ${hospitalAddress}.`,
        });
      }
    }

    // Notify eligible donors in same city
    const eligibleDonors = await User.find({
      role: 'donor',
      city: new RegExp(city, 'i'),
      bloodGroup,
    });
    for (const donor of eligibleDonors) {
      if (notificationRoutes.addNotification) {
        notificationRoutes.addNotification({
          userId: donor._id,
          type: 'emergency',
          title: '🚨 Emergency Donation Needed',
          message: `Hi ${donor.name}, ${patientName} urgently needs ${bloodGroup} blood at ${hospital}. Can you help?`,
        });
      }
    }

    res.status(201).json({
      message: 'Emergency SOS sent! Nearby blood banks and donors have been notified.',
      request,
      notified: {
        bloodBanks: nearbyBanks.length,
        donors: eligibleDonors.length,
      },
    });
  } catch (err) {
    console.error('Emergency error:', err);
    res.status(500).json({ error: 'Emergency request failed. Please call 1800-180-0099' });
  }
});

// ── Get my requests ──
router.get('/requests', protect, authorize('patient'), async (req, res) => {
  try {
    const requests = await BloodRequest.find({ patient: req.user._id })
      .populate('bloodBank', 'name address city')
      .sort('-createdAt');

    res.json({ requests, total: requests.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// ── Get request by ID ──
router.get('/request/:id', protect, authorize('patient'), async (req, res) => {
  try {
    const request = await BloodRequest.findOne({ _id: req.params.id, patient: req.user._id })
      .populate('bloodBank', 'name address city phone');
    if (!request) return res.status(404).json({ error: 'Request not found' });
    res.json({ request });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

// ── Cancel request ──
router.put('/request/:id/cancel', protect, authorize('patient'), async (req, res) => {
  try {
    const request = await BloodRequest.findOne({ _id: req.params.id, patient: req.user._id });
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (['completed', 'rejected'].includes(request.status)) {
      return res.status(400).json({ error: 'Cannot cancel this request' });
    }
    request.status = 'rejected';
    request.rejectionReason = 'Cancelled by patient';
    await request.save();
    res.json({ message: 'Request cancelled', request });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel request' });
  }
});

module.exports = router;
