const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/leaderboard
router.get('/', protect, async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  try {
    const users = await User.find({ points: { $gt: 0 } })
      .sort({ points: -1 })
      .limit(limit)
      .select('fullName username profilePicture role points institution department branch');

    const ranked = users.map((user, index) => ({
      rank: index + 1,
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      profilePicture: user.profilePicture,
      role: user.role,
      points: user.points,
      institution: user.institution || user.department,
      branch: user.branch,
    }));

    const currentUserRank = ranked.findIndex(
      (u) => u._id.toString() === req.user._id.toString()
    );

    res.json({
      leaderboard: ranked,
      currentUserRank: currentUserRank >= 0 ? currentUserRank + 1 : null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
