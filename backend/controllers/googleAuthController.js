const axios = require('axios');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Authenticate via Google OAuth
// @route   POST /api/auth/google
// @access  Public
//
// Flow:
//   1. Expo app signs the user in with Google → gets an accessToken
//   2. Expo app sends { accessToken } to this endpoint
//   3. We call Google's userinfo API to get the user's real profile
//   4. We find or create the user in MongoDB
//   5. We return our own JWT + user object to the app
// ─────────────────────────────────────────────────────────────────────────────
const googleAuth = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Google accessToken is required.',
      });
    }

    // ── Step 1: Verify the Google access token & fetch user profile ───────────
    let googleUser;
    try {
      const { data } = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      googleUser = data;
    } catch (err) {
      console.error('Google token verification failed:', err?.response?.data || err.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired Google access token.',
      });
    }

    // googleUser will contain: sub (google ID), name, email, picture
    const { sub: googleId, name, email, picture } = googleUser;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Could not retrieve email from Google account.',
      });
    }

    // ── Step 2: Find existing user or create a new one ────────────────────────
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // User exists — update their Google info if not already set
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        user.avatar = picture || user.avatar;
        await user.save();
      }
    } else {
      // New user — create an account from Google profile
      user = await User.create({
        fullName: name || email.split('@')[0],
        email: email.toLowerCase(),
        googleId,
        avatar: picture || null,
        authProvider: 'google',
        // No password — this is a Google-only account
      });
    }

    // ── Step 3: Issue our own JWT ────────────────────────────────────────────
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Google sign-in successful!',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        authProvider: user.authProvider,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during Google authentication.',
    });
  }
};

module.exports = { googleAuth };
