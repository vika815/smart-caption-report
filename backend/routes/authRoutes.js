const express = require('express');
const router = express.Router();
const { signup, login, getMe } = require('../controllers/authController');
const { googleAuth } = require('../controllers/googleAuthController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/signup        — Register a new user (email + password)
router.post('/signup', signup);

// POST /api/auth/login         — Login an existing user (email + password)
router.post('/login', login);

// POST /api/auth/google        — Sign in / sign up with Google OAuth
//   Body: { accessToken: "<google_access_token>" }
router.post('/google', googleAuth);

// GET  /api/auth/me            — Get logged-in user's profile (JWT protected)
router.get('/me', protect, getMe);

module.exports = router;
