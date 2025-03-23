const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'כתובת המייל כבר קיימת במערכת' });
    }

    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'שם המשתמש כבר קיים במערכת' });
    }

    // Create user
    user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Create token
    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'שגיאת שרת' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  console.log(`👤 Login attempt: ${email}`);

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ Login failed: User with email ${email} not found`);
      return res.status(401).json({ message: 'אימייל או סיסמה שגויים' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`❌ Login failed: Incorrect password for ${email}`);
      return res.status(401).json({ message: 'אימייל או סיסמה שגויים' });
    }

    console.log(`✅ Login successful: ${email} (${user.username})`);
    
    // Create token
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    console.error(`❌ Login error:`, error);
    res.status(500).json({ message: 'שגיאת שרת' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'שגיאת שרת' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};