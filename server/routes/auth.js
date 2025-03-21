const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { check } = require('express-validator');
const { protect } = require('../middleware/auth');

// @route   POST /api/auth/register
router.post('/register', [
  check('username', 'שם משתמש נדרש').not().isEmpty(),
  check('email', 'אנא הכנס כתובת אימייל תקינה').isEmail(),
  check('password', 'אנא הכנס סיסמה באורך 6 תווים לפחות').isLength({ min: 6 })
], registerUser);

// @route   POST /api/auth/login
router.post('/login', [
  check('email', 'אנא הכנס כתובת אימייל תקינה').isEmail(),
  check('password', 'סיסמה נדרשת').exists()
], loginUser);

// @route   GET /api/auth/me
router.get('/me', protect, getMe);

module.exports = router;