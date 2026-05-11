const User = require('../models/User');

const startOfWeek = (date = new Date()) => {
  const current = new Date(date);
  const day = current.getDay();
  current.setHours(0, 0, 0, 0);
  current.setDate(current.getDate() - day);
  return current;
};

const startOfMonth = (date = new Date()) => {
  const current = new Date(date);
  current.setHours(0, 0, 0, 0);
  current.setDate(1);
  return current;
};

const normalizePoints = (user) => {
  const weekStart = startOfWeek();
  const monthStart = startOfMonth();

  let changed = false;
  if (!user.weeklyReset || user.weeklyReset < weekStart) {
    user.pointsWeekly = 0;
    user.weeklyReset = weekStart;
    changed = true;
  }

  if (!user.monthlyReset || user.monthlyReset < monthStart) {
    user.pointsMonthly = 0;
    user.monthlyReset = monthStart;
    changed = true;
  }

  return changed;
};

const addUserPoints = async (userId, delta) => {
  if (!userId || delta === 0) return null;
  const user = await User.findById(userId);
  if (!user) return null;

  normalizePoints(user);
  user.points = (user.points || 0) + delta;
  user.pointsWeekly = (user.pointsWeekly || 0) + delta;
  user.pointsMonthly = (user.pointsMonthly || 0) + delta;
  await user.save();
  return user;
};

const getLeaderboardField = (type) => {
  if (type === 'weekly') return 'pointsWeekly';
  if (type === 'monthly') return 'pointsMonthly';
  return 'points';
};

module.exports = {
  addUserPoints,
  getLeaderboardField,
  startOfWeek,
  startOfMonth,
};
