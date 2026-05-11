const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/connections/me — current user's connections
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('connections', 'fullName profilePicture role institution branch year department designation');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.connections || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/connections/:id — connect with another user
router.post('/:id', protect, async (req, res) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.user.id.toString()) {
      return res.status(400).json({ message: 'Cannot connect to yourself' });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(req.user.id),
      User.findById(targetId),
    ]);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    const alreadyConnected = currentUser.connections.some((id) => id.toString() === targetId);
    if (!alreadyConnected) {
      currentUser.connections.push(targetId);
      targetUser.connections.push(currentUser._id);
      await Promise.all([currentUser.save(), targetUser.save()]);
    }

    const populated = await User.findById(req.user.id).populate('connections', 'fullName profilePicture role institution branch year department designation');
    res.json({ connected: true, connections: populated.connections });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/connections/mentors — list faculty + high-point students for mentoring
router.get('/mentors', protect, async (req, res) => {
  try {
    const { search, role } = req.query;
    const query = { _id: { $ne: req.user.id } };
    if (role && role !== 'all') {
      query.role = role;
    } else {
      query.role = { $in: ['faculty', 'admin'] };
    }
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }
    const users = await User.find(query)
      .select('fullName profilePicture role bio points department designation institution branch year')
      .sort({ points: -1 })
      .limit(30);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/connections/peers — all other users (for peer connection)
router.get('/peers', protect, async (req, res) => {
  try {
    const { search, role } = req.query;
    const query = { _id: { $ne: req.user.id } };
    if (role && role !== 'all') query.role = role;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { institution: { $regex: search, $options: 'i' } },
        { branch: { $regex: search, $options: 'i' } },
      ];
    }
    const users = await User.find(query)
      .select('fullName profilePicture role bio points institution branch year department designation')
      .sort({ points: -1 })
      .limit(40);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
