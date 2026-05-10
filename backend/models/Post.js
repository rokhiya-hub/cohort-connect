const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    mediaUrls: [{ type: String }],
    mediaType: { type: String, enum: ['image', 'video', 'file', null], default: null },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    shares: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    watchTime: { type: Number, default: 0 },
    isAIGenerated: { type: Boolean, default: false },
    isRemoved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

postSchema.virtual('likeCount').get(function () {
  return this.likes.length;
});

postSchema.virtual('saveCount').get(function () {
  return this.savedBy.length;
});

postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Post', postSchema);
