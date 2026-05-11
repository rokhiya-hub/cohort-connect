const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const { addUserPoints } = require('../utils/points');

const router = express.Router();

// GET /api/posts — paginated feed
router.get('/', protect, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  try {
    const posts = await Post.find({ isRemoved: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'fullName username profilePicture role');

    const total = await Post.countDocuments({ isRemoved: false });
    const userId = req.user._id.toString();

    const enriched = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({ post: post._id, isRemoved: false });
        const obj = post.toObject();
        obj.isLiked = post.likes.map((l) => l.toString()).includes(userId);
        obj.isSaved = post.savedBy.map((s) => s.toString()).includes(userId);
        obj.likeCount = post.likes.length;
        obj.saveCount = post.savedBy.length;
        obj.commentCount = commentCount;
        return obj;
      })
    );

    res.json({ posts: enriched, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/posts/trending — top liked posts
router.get('/trending', protect, async (req, res) => {
  try {
    const posts = await Post.find({ isRemoved: false })
      .sort({ 'likes': -1 })
      .limit(5)
      .populate('author', 'fullName username profilePicture role');

    const userId = req.user._id.toString();

    const enriched = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({ post: post._id, isRemoved: false });
        const obj = post.toObject();
        obj.isLiked = post.likes.map((l) => l.toString()).includes(userId);
        obj.isSaved = post.savedBy.map((s) => s.toString()).includes(userId);
        obj.likeCount = post.likes.length;
        obj.saveCount = post.savedBy.length;
        obj.commentCount = commentCount;
        return obj;
      })
    );

    res.json({ posts: enriched });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/posts/deadlines — posts mentioning deadlines
router.get('/deadlines', protect, async (req, res) => {
  try {
    const posts = await Post.find({
      isRemoved: false,
      content: { $regex: /deadline|due|exam|submission/i }
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('author', 'fullName username profilePicture role');

    const userId = req.user._id.toString();

    const enriched = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({ post: post._id, isRemoved: false });
        const obj = post.toObject();
        obj.isLiked = post.likes.map((l) => l.toString()).includes(userId);
        obj.isSaved = post.savedBy.map((s) => s.toString()).includes(userId);
        obj.likeCount = post.likes.length;
        obj.saveCount = post.savedBy.length;
        obj.commentCount = commentCount;
        return obj;
      })
    );

    res.json({ posts: enriched });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/posts/:id — single post
router.get('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'fullName username profilePicture role');
    if (!post || post.isRemoved) return res.status(404).json({ message: 'Post not found' });
    const userId = req.user._id.toString();
    const commentCount = await Comment.countDocuments({ post: post._id, isRemoved: false });
    const obj = post.toObject();
    obj.isLiked = post.likes.map((l) => l.toString()).includes(userId);
    obj.isSaved = post.savedBy.map((s) => s.toString()).includes(userId);
    obj.likeCount = post.likes.length;
    obj.saveCount = post.savedBy.length;
    obj.commentCount = commentCount;
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/posts — create post
router.post(
  '/',
  protect,
  [body('content').trim().notEmpty().withMessage('Content is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { content, mediaUrls, mediaType, isAIGenerated } = req.body;
    try {
      const post = await Post.create({
        author: req.user._id,
        content,
        mediaUrls: mediaUrls || [],
        mediaType: mediaType || null,
        isAIGenerated: isAIGenerated || false,
      });
      await post.populate('author', 'fullName username profilePicture role');
      await addUserPoints(req.user._id, 10);
      if (post.isAIGenerated) await addUserPoints(req.user._id, 5);
      res.status(201).json(post);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// PUT /api/posts/:id — update post (owner only)
router.put('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isRemoved) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    post.content = req.body.content || post.content;
    post.mediaUrls = req.body.mediaUrls || post.mediaUrls;
    post.mediaType = req.body.mediaType || post.mediaType;
    await post.save();
    await post.populate('author', 'fullName username profilePicture role');
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/posts/:id (owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    post.isRemoved = true;
    await post.save();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/posts/:id/like — toggle like
router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isRemoved) return res.status(404).json({ message: 'Post not found' });
    const userId = req.user._id.toString();
    const liked = post.likes.map((l) => l.toString()).includes(userId);
    if (liked) {
      post.likes = post.likes.filter((l) => l.toString() !== userId);
      await addUserPoints(post.author, -2);
    } else {
      post.likes.push(req.user._id);
      await addUserPoints(post.author, 2);
    }
    await post.save();
    res.json({ liked: !liked, likeCount: post.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/posts/:id/save — toggle save
router.post('/:id/save', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isRemoved) return res.status(404).json({ message: 'Post not found' });
    const userId = req.user._id.toString();
    const saved = post.savedBy.map((s) => s.toString()).includes(userId);
    if (saved) {
      post.savedBy = post.savedBy.filter((s) => s.toString() !== userId);
      await User.findByIdAndUpdate(req.user._id, { $pull: { savedPosts: post._id } });
      await addUserPoints(post.author, -5);
    } else {
      post.savedBy.push(req.user._id);
      await User.findByIdAndUpdate(req.user._id, { $push: { savedPosts: post._id } });
      await addUserPoints(post.author, 5);
    }
    await post.save();
    res.json({ saved: !saved, saveCount: post.savedBy.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/posts/:id/view — track view time
router.post('/:id/view', protect, async (req, res) => {
  const { watchTime } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isRemoved) return res.status(404).json({ message: 'Post not found' });
    if (watchTime && watchTime > 0) {
      post.watchTime += watchTime;
    }

    const hasViewed = post.viewedBy.map((u) => u.toString()).includes(req.user._id.toString());
    let pointsAwarded = 0;
    if (!hasViewed && watchTime >= 5) {
      post.viewedBy.push(req.user._id);
      post.views += 1;
      await addUserPoints(post.author, 1);
      pointsAwarded = 1;
    }
    await post.save();
    res.json({ message: 'View tracked', pointsAwarded });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/posts/:id/verify-helpful — admin-only bonus points
router.post('/:id/verify-helpful', protect, adminOnly, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isRemoved) return res.status(404).json({ message: 'Post not found' });
    if (post.isVerifiedHelpful) return res.status(400).json({ message: 'Post already verified helpful' });
    post.isVerifiedHelpful = true;
    await post.save();
    await addUserPoints(post.author, 20);
    res.json({ message: 'Post marked as helpful and author awarded points' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/posts/:id/comments
router.get('/:id/comments', protect, async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id, isRemoved: false, parentComment: null })
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

// POST /api/posts/:id/comments — add comment
router.post(
  '/:id/comments',
  protect,
  [body('content').trim().notEmpty().withMessage('Comment content required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { content, parentComment } = req.body;
    try {
      const post = await Post.findById(req.params.id);
      if (!post || post.isRemoved) return res.status(404).json({ message: 'Post not found' });
      const comment = await Comment.create({
        post: req.params.id,
        author: req.user._id,
        content,
        parentComment: parentComment || null,
      });
      await comment.populate('author', 'fullName username profilePicture role');
      await addUserPoints(post.author, 3);
      res.status(201).json(comment);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
