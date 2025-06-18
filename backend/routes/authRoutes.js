const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware'); // Assuming you might add a 'get me' route later

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    user = await User.findOne({ username });
     if (user) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    user = new User({ username, email, password }); // Password hashing is handled by pre-save hook in model

    await user.save();

    // Generate JWT
    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }); // Token expires in 7 days

    res.status(201).json({
      token,
      user: { // Return basic user info without password
         id: user.id,
         username: user.username,
         email: user.email,
         xp: user.xp,
         level: user.level,
         achievements: user.achievements
      }
    });

  } catch (err) {
    console.error("Registration Error:", err.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
       user: {
         id: user.id,
         username: user.username,
         email: user.email,
         xp: user.xp,
         level: user.level,
         achievements: user.achievements
      }
    });

  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    // req.user is attached by the protect middleware
    // We already selected '-password' in the middleware
    res.json(req.user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;