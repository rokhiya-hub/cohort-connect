const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const Comment = require('../models/Comment');
const { protect } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

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

// POST /api/videos/:id/save
router.post('/:id/save', protect, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    const idx = video.savedBy.findIndex((id) => id.toString() === req.user.id.toString());
    if (idx === -1) {
      video.savedBy.push(req.user.id);
    } else {
      video.savedBy.splice(idx, 1);
    }
    await video.save();
    res.json({ saved: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/videos/feed — paginated feed with all videos
router.get('/feed/all', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const videos = await Video.find()
      .populate('author', 'fullName username profilePicture role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Video.countDocuments();
    const userId = req.user._id.toString();
    
    const enriched = videos.map((video) => {
      const obj = video.toObject();
      obj.isLiked = video.likes.map((l) => l.toString()).includes(userId);
      obj.isSaved = video.savedBy.map((s) => s.toString()).includes(userId);
      obj.likeCount = video.likes.length;
      obj.saveCount = video.savedBy.length;
      obj.type = 'video'; // Mark content type
      return obj;
    });
    
    res.json({ videos: enriched, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/videos/:id/comments — get comments for a video
router.get('/:id/comments', protect, async (req, res) => {
  try {
    const comments = await Comment.find({ video: req.params.id, isRemoved: false, parentComment: null })
      .sort({ createdAt: -1 })
      .populate('author', 'fullName username profilePicture role');

    const enriched = await Promise.all(
      comments.map(async (c) => {
        const replies = await Comment.find({ parentComment: c._id, isRemoved: false })
          .sort({ createdAt: 1 })
          .populate('author', 'fullName username profilePicture role');
        const obj = c.toObject();
        obj.replies = replies;
        obj.likeCount = c.likes.length;
        obj.isLiked = c.likes.map((l) => l.toString()).includes(req.user._id.toString());
        return obj;
      })
    );

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/videos/:id/comments — add comment to video
router.post(
  '/:id/comments',
  protect,
  [body('content').trim().notEmpty().withMessage('Comment content required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { content, parentComment } = req.body;
    try {
      const video = await Video.findById(req.params.id);
      if (!video) return res.status(404).json({ message: 'Video not found' });
      const comment = await Comment.create({
        video: req.params.id,
        author: req.user._id,
        content,
        parentComment: parentComment || null,
      });
      await comment.populate('author', 'fullName username profilePicture role');
      res.status(201).json(comment);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
