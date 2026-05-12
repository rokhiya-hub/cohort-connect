const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Notification infrastructure scaffold — push notifications (FCM/Web Push ready)
// Schema will extend to store device tokens for mobile app (Future: React Native)

router.get('/', protect, async (req, res) => {
  // TODO: fetch from Notification model once created
  res.json({ notifications: [], unreadCount: 0, message: 'Notification system scaffolded' });
});

router.post('/mark-read/:id', protect, async (req, res) => {
  res.json({ success: true });
});

router.post('/subscribe', protect, async (req, res) => {
  // TODO: store FCM device token for push notifications (mobile app integration)
  const { deviceToken, platform } = req.body;
  res.json({ success: true, message: 'Device token stored for push notifications' });
});

module.exports = router;
