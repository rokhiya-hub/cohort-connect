const express = require('express');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Video = require('../models/Video');
const { protect } = require('../middleware/auth');
const { addUserPoints } = require('../utils/points');

const router = express.Router();

// DELETE /api/comments/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (!comment.isRemoved) {
      if (comment.post) {
        const post = await Post.findById(comment.post);
        if (post) {
          await addUserPoints(post.author, -3);
        }
      }
    }
    comment.isRemoved = true;
    await comment.save();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/comments/:id/like — toggle like on comment
router.post('/:id/like', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment || comment.isRemoved) return res.status(404).json({ message: 'Comment not found' });
    const userId = req.user._id.toString();
    const liked = comment.likes.map((l) => l.toString()).includes(userId);
    if (liked) {
      comment.likes = comment.likes.filter((l) => l.toString() !== userId);
    } else {
      comment.likes.push(req.user._id);
    }
    await comment.save();
    res.json({ liked: !liked, likeCount: comment.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
