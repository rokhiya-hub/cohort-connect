const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/:id — public profile
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -adminCode');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/me — update own profile
router.put('/me', protect, async (req, res) => {
  const {
    fullName, username, institution, branch, year, department,
    designation, personalEmail, linkedin, phone, bio, profilePicture, organization,
  } = req.body;
  try {
    if (username && username !== req.user.username) {
      const taken = await User.findOne({ username });
      if (taken) return res.status(400).json({ message: 'Username already taken' });
    }
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { fullName, username, institution, branch, year, department,
        designation, personalEmail, linkedin, phone, bio, profilePicture, organization },
      { new: true, runValidators: true }
    ).select('-password -adminCode');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/me/password — change password
router.put('/me/password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
