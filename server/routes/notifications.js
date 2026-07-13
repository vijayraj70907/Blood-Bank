const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// ── Mock notification store ──
let notifications = [
  { id: 1, userId: null, type: 'emergency', title: 'Emergency O- Request', message: 'Apollo Hospital needs O- blood urgently', read: false, createdAt: new Date() },
  { id: 2, userId: null, type: 'stock', title: 'Low Stock Alert', message: 'AB- stock critically low at City Blood Bank', read: false, createdAt: new Date(Date.now() - 900000) },
  { id: 3, userId: null, type: 'donor', title: 'New Donor', message: 'Ramesh Kumar registered as a blood donor', read: true, createdAt: new Date(Date.now() - 3600000) },
  { id: 4, userId: null, type: 'expiry', title: 'Blood Expiry Warning', message: '5 units of A+ blood expire in 3 days', read: true, createdAt: new Date(Date.now() - 10800000) },
  { id: 5, userId: null, type: 'appointment', title: 'Appointment Reminder', message: 'Suresh Babu has an appointment tomorrow at 10:00 AM', read: true, createdAt: new Date(Date.now() - 86400000) },
];

// ── Get notifications ──
router.get('/', protect, async (req, res) => {
  try {
    const { unread } = req.query;
    let result = notifications.filter(n => n.userId === null || String(n.userId) === String(req.user._id));
    if (unread === 'true') {
      result = result.filter(n => !n.read);
    }
    res.json({
      notifications: result,
      unreadCount: result.filter(n => !n.read).length,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// ── Mark as read ──
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notif = notifications.find(n => n.id === parseInt(req.params.id));
    if (notif) notif.read = true;
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// ── Mark all as read ──
router.put('/read-all', protect, async (req, res) => {
  notifications.forEach(n => (n.read = true));
  res.json({ message: 'All notifications marked as read' });
});

// ── Create notification (internal use) ──
router.post('/', protect, async (req, res) => {
  try {
    const { type, title, message, userId } = req.body;
    const notif = {
      id: Date.now(),
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date(),
    };
    notifications.unshift(notif);

    // TODO: Send push notification / SMS / email based on type
    // TODO: Send WhatsApp notification (optional)

    res.status(201).json({ message: 'Notification created', notification: notif });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// ── Delete notification ──
router.delete('/:id', protect, async (req, res) => {
  const filtered = notifications.filter(n => n.id !== parseInt(req.params.id));
  notifications.splice(0, notifications.length, ...filtered);
  res.json({ message: 'Notification deleted' });
});

router.notifications = notifications;
router.addNotification = (notif) => {
  notifications.unshift({
    id: Date.now() + Math.floor(Math.random() * 1000),
    read: false,
    createdAt: new Date(),
    ...notif
  });
};

module.exports = router;
