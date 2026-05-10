const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/auth');

const router = express.Router();

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'cohort-admin-2024';

router.post(
  '/register',
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['student', 'faculty', 'admin']).withMessage('Invalid role'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { fullName, email, password, role, institution, branch, year, department,
      designation, adminCode, personalEmail, linkedin, phone, bio, organization } = req.body;

    try {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: 'Email already registered' });

      if (role === 'admin' && adminCode !== ADMIN_SECRET) {
        return res.status(400).json({ message: 'Invalid admin code' });
      }

      const user = await User.create({
        fullName, email, password, role,
        institution, branch, year,
        department, designation,
        adminCode: role === 'admin' ? adminCode : undefined,
        organization,
        personalEmail, linkedin, phone, bio,
      });

      const token = generateToken(user._id);
      res.status(201).json({ token, user: user.toPublic() });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      const token = generateToken(user._id);
      res.json({ token, user: user.toPublic() });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user.toPublic() });
});

module.exports = router;
