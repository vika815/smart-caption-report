// ─────────────────────────────────────────────────────────────────────────────
//  Smart Caption Generator — Express + MongoDB Backend
//  Entry Point: server.js
// ─────────────────────────────────────────────────────────────────────────────
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// ─── Route Imports ────────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const captionRoutes = require('./routes/captionRoutes');

// ─── Caption controller (for legacy /generate route) ─────────────────────────
const { generateCaption } = require('./controllers/captionController');

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

// ─── Initialize Express App ───────────────────────────────────────────────────
const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────

// HTTP request logger
app.use(morgan('dev'));

// CORS — allow requests from the Expo mobile app on any origin during development
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Smart Caption Generator API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      captions: '/api/captions',
      legacyGenerate: '/generate',
    },
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────

// Auth routes: /api/auth/signup, /api/auth/login, /api/auth/me
app.use('/api/auth', authRoutes);

// Caption routes: /api/captions/generate, /api/captions/history, /api/captions/:id
app.use('/api/captions', captionRoutes);

// ─── Legacy Route ─────────────────────────────────────────────────────────────
// Matches the original App.js call: axios.post(`${BACKEND_URL}/generate`, {...})
// This route works WITHOUT authentication so the existing frontend works as-is.
app.post('/generate', (req, res, next) => {
  // Inject a null user so the controller skips saving to DB
  req.user = null;
  generateCaption(req, res, next);
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected server error occurred.',
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📡 API Base URL    : http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check    : http://localhost:${PORT}/`);
  console.log(`🔗 Legacy Generate : http://localhost:${PORT}/generate\n`);
});
