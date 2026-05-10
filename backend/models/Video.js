const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  url: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  category: {
    type: String,
    enum: ['interviews', 'internships', 'exam-prep', 'resources', 'events', 'tech-ai', 'general'],
    default: 'general',
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  tags: [{ type: String, trim: true }],
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);
