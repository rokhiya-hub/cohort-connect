const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  url: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  category: {
    type: String,
    enum: ['interviews', 'internships', 'exam-prep', 'resources', 'events', 'tech-ai', 'career', 'general'],
    default: 'general',
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  views: { type: Number, default: 0 },
  viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  shares: { type: Number, default: 0 },
  tags: [{ type: String, trim: true }],
}, { timestamps: true });

videoSchema.virtual('likeCount').get(function () {
  return this.likes.length;
});

videoSchema.virtual('saveCount').get(function () {
  return this.savedBy.length;
});

videoSchema.set('toJSON', { virtuals: true });
videoSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Video', videoSchema);
