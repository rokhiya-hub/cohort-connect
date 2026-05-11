const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['student', 'faculty', 'admin'], required: true },
    username: { type: String, unique: true, trim: true },
    profilePicture: { type: String, default: '' },
    points: { type: Number, default: 0 },
    pointsWeekly: { type: Number, default: 0 },
    pointsMonthly: { type: Number, default: 0 },
    weeklyReset: { type: Date, default: Date.now },
    monthlyReset: { type: Date, default: Date.now },

    // Student fields
    institution: { type: String, trim: true },
    branch: { type: String, trim: true },
    year: { type: String, trim: true },

    // Faculty fields
    department: { type: String, trim: true },
    designation: { type: String, trim: true },

    // Admin fields
    adminCode: { type: String },
    organization: { type: String, trim: true },

    // Optional profile fields
    personalEmail: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    phone: { type: String, trim: true },
    bio: { type: String, trim: true, maxlength: 500 },

    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre('save', function (next) {
  if (!this.username) {
    const base = this.fullName.toLowerCase().replace(/\s+/g, '');
    const rand = Math.floor(Math.random() * 9000) + 1000;
    this.username = `${base}${rand}`;
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublic = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.adminCode;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
