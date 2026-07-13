const express = require('express');
const router = express.Router();
const BloodBank = require('../models/BloodBank');
const BloodRequest = require('../models/BloodRequest');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// ── Dashboard stats ──
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const bank = await BloodBank.findOne({ owner: req.user._id });
    if (!bank) return res.status(404).json({ error: 'No blood bank found for this admin' });

    const totalUnits = bank.inventory.reduce((sum, i) => sum + i.units, 0);
    const totalRequests = await BloodRequest.countDocuments({ bloodBank: bank._id });
    const pendingRequests = await BloodRequest.countDocuments({ bloodBank: bank._id, status: 'pending' });
    const approvedRequests = await BloodRequest.countDocuments({ bloodBank: bank._id, status: 'approved' });

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayDonations = await Appointment.countDocuments({
      bloodBank: bank._id,
      status: 'completed',
      date: { $gte: today },
    });

    res.json({
      totalUnits,
      totalRequests,
      pendingRequests,
      approvedRequests,
      todayDonations,
      inventory: bank.inventory,
      bankName: bank.name,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// ── Get blood requests for this bank ──
router.get('/requests', protect, authorize('admin'), async (req, res) => {
  try {
    const bank = await BloodBank.findOne({ owner: req.user._id });
    if (!bank) return res.status(404).json({ error: 'Blood bank not found' });

    const { status, emergency, bloodGroup, city, nearby } = req.query;
    
    // Construct search/filter query
    const filter = {};
    if (status) filter.status = status;
    if (emergency === 'true') filter.isEmergency = true;
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (city) filter.city = new RegExp(city, 'i');
    if (nearby === 'true' && bank.city) {
      filter.city = new RegExp(bank.city, 'i');
    }

    const requests = await BloodRequest.find({
      $and: [
        filter,
        {
          $or: [
            { bloodBank: bank._id },
            { bloodBank: null, status: 'pending' }
          ]
        }
      ]
    })
      .populate('patient', 'name email phone')
      .sort('-createdAt');

    res.json({ requests });
  } catch (err) {
    console.error('Fetch requests error:', err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// ── Accept/reject request ──
router.put('/request/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const bank = await BloodBank.findOne({ owner: req.user._id });

    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    const oldStatus = request.status;
    request.status = status;
    request.bloodBank = bank?._id;
    request.processedBy = req.user._id;
    request.processedAt = new Date();
    if (rejectionReason) request.rejectionReason = rejectionReason;
    if (status === 'completed') request.completedAt = new Date();

    await request.save();

    // If changing to an active/approved/accepted/completed status from pending, decrement stock
    const isDecrementStatus = ['approved', 'accepted', 'blood arranged', 'completed'].includes(status);
    const wasPending = ['pending'].includes(oldStatus);
    
    if (isDecrementStatus && wasPending && bank) {
      const item = bank.inventory.find(i => i.group === request.bloodGroup);
      if (item) {
        item.units = Math.max(0, item.units - request.units);
        item.lastUpdated = new Date();
        item.status = item.units <= 10 ? 'critical' : item.units <= 30 ? 'low' : 'available';
        await bank.save();
      }
    }

    res.json({ message: `Request status updated to ${status}`, request });
  } catch (err) {
    console.error('Update request error:', err);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// ── Update inventory stock directly ──
router.put('/inventory', protect, authorize('admin'), async (req, res) => {
  try {
    const { group, units, action } = req.body; // action: 'add' or 'remove' or 'set'
    const bank = await BloodBank.findOne({ owner: req.user._id });
    if (!bank) return res.status(404).json({ error: 'Blood bank not found' });

    let item = bank.inventory.find(i => i.group === group);
    if (!item) {
      item = { group, units: 0, status: 'available' };
      bank.inventory.push(item);
      item = bank.inventory.find(i => i.group === group);
    }

    const numUnits = parseInt(units) || 0;
    if (action === 'add') {
      item.units += numUnits;
    } else if (action === 'remove') {
      if (item.units < numUnits) {
        return res.status(400).json({ error: 'Not enough blood units in stock' });
      }
      item.units -= numUnits;
    } else {
      item.units = numUnits;
    }

    item.lastUpdated = new Date();
    item.status = item.units <= 10 ? 'critical' : item.units <= 30 ? 'low' : 'available';

    await bank.save();
    res.json({ message: 'Stock updated successfully', inventory: bank.inventory });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// ── Get donors for this bank ──
router.get('/donors', protect, authorize('admin'), async (req, res) => {
  try {
    const bank = await BloodBank.findOne({ owner: req.user._id });
    const donorIds = await Appointment.distinct('donor', { bloodBank: bank?._id });
    const donors = await User.find({ _id: { $in: donorIds }, role: 'donor' });

    const donorData = await Promise.all(donors.map(async (d) => {
      const donationCount = await Appointment.countDocuments({ donor: d._id, status: 'completed' });
      const lastAppointment = await Appointment.findOne({ donor: d._id, status: 'completed' }).sort('-date');
      return { ...d.toJSON(), donationCount, lastDonation: lastAppointment?.date };
    }));

    res.json({ donors: donorData });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch donors' });
  }
});

// ── Get appointments ──
router.get('/appointments', protect, authorize('admin'), async (req, res) => {
  try {
    const bank = await BloodBank.findOne({ owner: req.user._id });
    const appointments = await Appointment.find({ bloodBank: bank?._id })
      .populate('donor', 'name email phone bloodGroup')
      .sort('-date');

    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// ── Confirm/reschedule appointment ──
router.put('/appointment/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, date, timeSlot } = req.body;
    const apt = await Appointment.findById(req.params.id);
    if (!apt) return res.status(404).json({ error: 'Appointment not found' });

    if (status) apt.status = status;
    if (date) apt.date = date;
    if (timeSlot) apt.timeSlot = timeSlot;
    apt.confirmedBy = req.user._id;

    // If completed, add donation to blood bank inventory
    if (status === 'completed') {
      const bank = await BloodBank.findOne({ owner: req.user._id });
      if (bank) {
        const item = bank.inventory.find(i => i.group === apt.bloodGroup);
        if (item) {
          item.units += apt.units;
          item.lastUpdated = new Date();
          item.collectionDate = new Date();
          item.status = item.units <= 10 ? 'critical' : item.units <= 30 ? 'low' : 'available';
          bank.totalDonations += 1;
          await bank.save();
        }
      }
    }

    await apt.save();
    res.json({ message: `Appointment ${status || 'updated'}`, appointment: apt });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// ── Reports ──
router.get('/reports/:type', protect, authorize('admin'), async (req, res) => {
  try {
    const bank = await BloodBank.findOne({ owner: req.user._id });
    const { type } = req.params;

    let data;
    switch (type) {
      case 'daily':
        const today = new Date(); today.setHours(0, 0, 0, 0);
        data = await Appointment.find({ bloodBank: bank?._id, date: { $gte: today }, status: 'completed' });
        break;
      case 'monthly':
        const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
        data = await Appointment.find({ bloodBank: bank?._id, date: { $gte: monthStart }, status: 'completed' });
        break;
      case 'inventory':
        data = bank?.inventory;
        break;
      case 'expiry':
        data = bank?.inventory.filter(i => {
          if (!i.expiryDate) return false;
          const daysUntilExpiry = (new Date(i.expiryDate) - new Date()) / 86400000;
          return daysUntilExpiry <= 7;
        });
        break;
      default:
        data = [];
    }

    res.json({ report: type, data, generatedAt: new Date() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

module.exports = router;
