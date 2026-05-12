const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const StudyGroup = require('../models/StudyGroup');

// StudyGroups API — backend CRUD, join/unjoin, and details

router.get('/', protect, async (req, res) => {
  try {
    const groups = await StudyGroup.find().sort({ createdAt: -1 }).lean();
    res.json({ groups });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id).lean();
    if (!group) return res.status(404).json({ message: 'Study group not found' });
    res.json({ group });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { name, description, tags } = req.body;
    const group = await StudyGroup.create({
      name: (name || 'New Study Group').trim(),
      description: (description || '').trim(),
      tags: Array.isArray(tags) ? tags.filter(Boolean) : typeof tags === 'string' ? tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
      creator: req.user._id,
      members: [req.user._id],
    });
    res.status(201).json({ group });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Study group not found' });
    if (!group.creator.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this group' });
    }

    const { name, description, tags } = req.body;
    if (name) group.name = name.trim();
    if (description !== undefined) group.description = description.trim();
    if (tags !== undefined) {
      group.tags = Array.isArray(tags) ? tags.filter(Boolean) : typeof tags === 'string' ? tags.split(',').map((tag) => tag.trim()).filter(Boolean) : group.tags;
    }
    await group.save();
    res.json({ group });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Study group not found' });
    if (!group.creator.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this group' });
    }
    await group.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/join', protect, async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Study group not found' });
    const userId = req.user._id;
    const alreadyJoined = group.members.some((memberId) => memberId.equals(userId));
    if (alreadyJoined) {
      group.members = group.members.filter((memberId) => !memberId.equals(userId));
    } else {
      group.members.push(userId);
    }
    await group.save();
    res.json({ group });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
