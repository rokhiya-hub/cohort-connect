const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

// GET /api/messages/conversations
router.get('/conversations', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .populate('participants', 'fullName profilePicture role')
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'fullName' } })
      .sort({ lastMessageAt: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/messages/conversations — create or fetch existing conversation
router.post('/conversations', protect, async (req, res) => {
  try {
    const { participantId } = req.body;
    if (!participantId) return res.status(400).json({ message: 'participantId required' });

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, participantId], $size: 2 },
    }).populate('participants', 'fullName profilePicture role');

    if (!conversation) {
      conversation = await Conversation.create({ participants: [req.user.id, participantId] });
      await conversation.populate('participants', 'fullName profilePicture role');
    }
    res.json(conversation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/messages/conversations/:id/messages
router.get('/conversations/:id/messages', protect, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (!conversation.participants.map(String).includes(req.user.id.toString())) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'fullName profilePicture')
      .sort({ createdAt: 1 });

    await Message.updateMany(
      { conversation: req.params.id, sender: { $ne: req.user.id }, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/messages/conversations/:id/messages
router.post('/conversations/:id/messages', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Message content required' });

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (!conversation.participants.map(String).includes(req.user.id.toString())) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const message = await Message.create({ conversation: req.params.id, sender: req.user.id, content: content.trim() });
    await message.populate('sender', 'fullName profilePicture');

    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/messages/unread-count
router.get('/unread-count', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id }).select('_id');
    const ids = conversations.map((c) => c._id);
    const count = await Message.countDocuments({ conversation: { $in: ids }, sender: { $ne: req.user.id }, read: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
