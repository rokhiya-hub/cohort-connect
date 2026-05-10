const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contentType: { type: String, enum: ['post', 'comment', 'user'], required: true },
    contentId: { type: String, required: true },
    reason: {
      type: String,
      enum: ['spam', 'harassment', 'hate_speech', 'nudity', 'misinformation', 'fraud', 'fake'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
    },
    moderatorNote: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
