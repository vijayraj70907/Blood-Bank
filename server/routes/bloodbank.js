const express = require('express');
const router = express.Router();
const BloodBank = require('../models/BloodBank');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// ── Get all blood banks (public) ──
router.get('/', async (req, res) => {
  try {
    const { city, state, group, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (city) filter.city = new RegExp(city, 'i');
    if (state) filter.state = new RegExp(state, 'i');

    const banks = await BloodBank.find(filter)
      .select('name address city state phone inventory isVerified rating location openingHours isOpen24x7')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort('-createdAt');

    const total = await BloodBank.countDocuments(filter);

    res.json({ banks, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blood banks' });
  }
});

// ── Get nearby blood banks (geospatial) ──
router.get('/nearby', async (req, res) => {
  try {
    const { lat = 17.385, lng = 78.4867, maxDistance = 50000 } = req.query;
    const banks = await BloodBank.find({
      isActive: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(maxDistance),
        },
      },
    }).select('name address city phone inventory location rating');

    res.json({ banks });
  } catch (err) {
    // Fallback if geospatial index not set up
    const banks = await BloodBank.find({ isActive: true }).limit(10);
    res.json({ banks });
  }
});

// ── Get blood bank by ID ──
router.get('/:id', async (req, res) => {
  try {
    const bank = await BloodBank.findById(req.params.id).populate('owner', 'name email phone');
    if (!bank) return res.status(404).json({ error: 'Blood bank not found' });
    res.json({ bank });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blood bank' });
  }
});

// ── Register blood bank (admin only) ──
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, licenseNumber, email, phone, address, city, state, pincode, openingHours, closingHours, isOpen24x7, lat, lng } = req.body;

    const bank = await BloodBank.create({
      name, licenseNumber, email, phone, address, city, state, pincode,
      openingHours, closingHours, isOpen24x7,
      owner: req.user._id,
      location: { type: 'Point', coordinates: [lng || 78.4867, lat || 17.385] },
      inventory: [
        { group: 'A+', units: 0 }, { group: 'A-', units: 0 },
        { group: 'B+', units: 0 }, { group: 'B-', units: 0 },
        { group: 'AB+', units: 0 }, { group: 'AB-', units: 0 },
        { group: 'O+', units: 0 }, { group: 'O-', units: 0 },
      ],
    });

    // Link blood bank to user (bypass pre-save hook)
    await User.findByIdAndUpdate(req.user._id, { bloodBankId: bank._id });

    res.status(201).json({ message: 'Blood bank registered successfully', bank });
  } catch (err) {
    console.error('Blood bank register error:', err);
    res.status(500).json({ error: 'Failed to register blood bank' });
  }
});

// ── Update blood bank ──
router.put('/:id', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const bank = await BloodBank.findById(req.params.id);
    if (!bank) return res.status(404).json({ error: 'Blood bank not found' });

    if (req.user.role === 'admin' && bank.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this blood bank' });
    }

    Object.assign(bank, req.body);
    await bank.save();
    res.json({ message: 'Blood bank updated', bank });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update blood bank' });
  }
});

// ── Update inventory ──
router.put('/:id/inventory', protect, authorize('admin'), async (req, res) => {
  try {
    const { group, units, expiryDate, collectionDate, storageLocation } = req.body;
    const bank = await BloodBank.findById(req.params.id);
    if (!bank) return res.status(404).json({ error: 'Blood bank not found' });

    const item = bank.inventory.find(i => i.group === group);
    if (item) {
      if (units !== undefined) item.units = units;
      if (expiryDate) item.expiryDate = expiryDate;
      if (collectionDate) item.collectionDate = collectionDate;
      if (storageLocation) item.storageLocation = storageLocation;
      item.lastUpdated = new Date();
      item.status = units <= 10 ? 'critical' : units <= 30 ? 'low' : 'available';
    } else {
      bank.inventory.push({ group, units, expiryDate, collectionDate, storageLocation });
    }

    await bank.save();
    res.json({ message: `${group} inventory updated`, inventory: bank.inventory });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update inventory' });
  }
});

// ── Search blood stock ──
router.get('/search/stock', async (req, res) => {
  try {
    const { group, city } = req.query;
    const filter = { isActive: true };
    if (city) filter.city = new RegExp(city, 'i');

    const banks = await BloodBank.find(filter).select('name city phone inventory');

    const results = banks
      .map(bank => {
        const item = group ? bank.inventory.find(i => i.group === group) : null;
        return {
          bankId: bank._id,
          name: bank.name,
          city: bank.city,
          phone: bank.phone,
          stock: group ? (item?.units || 0) : bank.inventory,
          available: group ? (item?.units || 0) > 0 : bank.inventory.some(i => i.units > 0),
        };
      })
      .filter(r => !group || r.stock > 0)
      .sort((a, b) => (b.stock || 0) - (a.stock || 0));

    res.json({ results, total: results.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to search blood stock' });
  }
});

module.exports = router;
