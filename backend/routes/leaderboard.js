const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { getLeaderboardField, startOfWeek, startOfMonth } = require('../utils/points');

const router = express.Router();

// GET /api/leaderboard
router.get('/', protect, async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const type = req.query.type || 'overall';
  const field = getLeaderboardField(type);

  try {
    const weekStart = startOfWeek();
    const monthStart = startOfMonth();

    await User.updateMany(
      { $or: [{ weeklyReset: { $lt: weekStart } }, { weeklyReset: { $exists: false } }] },
      { $set: { pointsWeekly: 0, weeklyReset: weekStart } }
    );
    await User.updateMany(
      { $or: [{ monthlyReset: { $lt: monthStart } }, { monthlyReset: { $exists: false } }] },
      { $set: { pointsMonthly: 0, monthlyReset: monthStart } }
    );

    const users = await User.find({ [field]: { $gt: 0 } })
      .sort({ [field]: -1 })
      .limit(limit)
      .select('fullName username profilePicture role points pointsWeekly pointsMonthly institution department branch');

    const ranked = users.map((user, index) => ({
      rank: index + 1,
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      profilePicture: user.profilePicture,
      role: user.role,
      points: user[field] || 0,
      institution: user.institution || user.department,
      branch: user.branch,
    }));

    const currentUser = await User.findById(req.user._id).select(field);
    let currentUserRank = null;
    if (currentUser) {
      const currentPoints = currentUser[field] || 0;
      currentUserRank = await User.countDocuments({ [field]: { $gt: currentPoints } }) + 1;
      if (currentPoints === 0) currentUserRank = null;
    }

    res.json({
      leaderboard: ranked,
      currentUserRank,
      type,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
