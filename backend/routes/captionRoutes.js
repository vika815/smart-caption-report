const express = require('express');
const router = express.Router();
const { generateCaption, getHistory, deleteCaption } = require('../controllers/captionController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/captions/generate  — Generate captions (auth required to save history)
router.post('/generate', protect, generateCaption);

// GET  /api/captions/history  — Get user's generation history (auth required)
router.get('/history', protect, getHistory);

// DELETE /api/captions/:id  — Delete a saved generation (auth required)
router.delete('/:id', protect, deleteCaption);

module.exports = router;
