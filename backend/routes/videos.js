const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const { protect } = require('../middleware/auth');

// GET /api/videos
router.get('/', protect, async (req, res) => {
  try {
    const { category, page = 1, limit = 12, search } = req.query;
    const query = {};
    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [videos, total] = await Promise.all([
      Video.find(query)
        .populate('author', 'fullName profilePicture role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Video.countDocuments(query),
    ]);
    res.json({ videos, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/videos
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, url, thumbnail, category, tags } = req.body;
    if (!title || !url) return res.status(400).json({ message: 'Title and URL are required' });
    const video = new Video({ title, description, url, thumbnail, category, tags: tags || [], author: req.user.id });
    await video.save();
    await video.populate('author', 'fullName profilePicture role');
    res.status(201).json(video);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/videos/my — current user's videos
router.get('/my', protect, async (req, res) => {
  try {
    const videos = await Video.find({ author: req.user.id })
      .populate('author', 'fullName profilePicture role')
      .sort({ createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/videos/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'fullName profilePicture role bio');
    if (!video) return res.status(404).json({ message: 'Video not found' });
    res.json(video);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/videos/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    if (video.author.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const { title, description, url, thumbnail, category, tags } = req.body;
    Object.assign(video, { title, description, url, thumbnail, category, tags });
    await video.save();
    await video.populate('author', 'fullName profilePicture role');
    res.json(video);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/videos/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    if (video.author.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await video.deleteOne();
    res.json({ message: 'Video deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/videos/:id/like
router.post('/:id/like', protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    const idx = video.likes.findIndex((id) => id.toString() === req.user.id.toString());
    if (idx === -1) {
      video.likes.push(req.user.id);
    } else {
      video.likes.splice(idx, 1);
    }
    await video.save();
    res.json({ likes: video.likes.length, liked: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
