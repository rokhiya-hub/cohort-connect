const express = require('express');
const { body, validationResult } = require('express-validator');
const Report = require('../models/Report');
const User = require('../models/User');
const Post = require('../models/Post');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// POST /api/reports — submit a report
router.post(
  '/',
  protect,
  [
    body('contentType').isIn(['post', 'comment', 'user']).withMessage('Invalid content type'),
    body('contentId').notEmpty().withMessage('Content ID required'),
    body('reason')
      .isIn(['spam', 'harassment', 'hate_speech', 'nudity', 'misinformation', 'fraud', 'fake'])
      .withMessage('Invalid reason'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { contentType, contentId, reason } = req.body;
    try {
      const report = await Report.create({
        reporter: req.user._id,
        contentType,
        contentId,
        reason,
      });
      res.status(201).json({ message: 'Report submitted', report });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// GET /api/reports — admin only
router.get('/', protect, adminOnly, async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  try {
    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .populate('reporter', 'fullName username');
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/reports/:id — admin update status
router.put('/:id', protect, adminOnly, async (req, res) => {
  const { status, moderatorNote } = req.body;
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, moderatorNote },
      { new: true }
    );
    if (!report) return res.status(404).json({ message: 'Report not found' });

    // If resolved as fake, penalize the post author
    if (status === 'resolved' && report.reason === 'fake' && report.contentType === 'post') {
      const post = await Post.findById(report.contentId);
      if (post) {
        await User.findByIdAndUpdate(post.author, { $inc: { points: -50 } });
      }
    }

    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
