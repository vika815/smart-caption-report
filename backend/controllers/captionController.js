const Caption = require('../models/Caption');
const { generateCaptionData } = require('../utils/captionEngine');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Generate captions, hashtags, and emojis
// @route   POST /api/captions/generate  (also aliased at POST /generate)
// @access  Private (JWT required) — or Public via /generate for dev compatibility
// ─────────────────────────────────────────────────────────────────────────────
const generateCaption = async (req, res) => {
  try {
    const { keywords, mood, platform } = req.body;

    // Validate required fields
    if (!keywords || !mood || !platform) {
      return res.status(400).json({
        success: false,
        message: 'keywords, mood, and platform are required.',
      });
    }

    // Validate mood enum
    const validMoods = ['Funny', 'Romantic', 'Sad', 'Motivational', 'Professional'];
    if (!validMoods.includes(mood)) {
      return res.status(400).json({
        success: false,
        message: `Invalid mood. Must be one of: ${validMoods.join(', ')}`,
      });
    }

    // Validate platform enum
    const validPlatforms = ['Instagram', 'WhatsApp', 'LinkedIn', 'Twitter'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({
        success: false,
        message: `Invalid platform. Must be one of: ${validPlatforms.join(', ')}`,
      });
    }

    // ── Run the generation engine ────────────────────────────────────────────
    const resultData = generateCaptionData(keywords, mood, platform);

    // ── Save to MongoDB (only if user is authenticated) ──────────────────────
    let savedCaption = null;
    if (req.user) {
      savedCaption = await Caption.create({
        userId: req.user._id,
        keywords,
        mood,
        platform,
        resultData,
      });
    }

    return res.status(200).json({
      success: true,
      // Match the exact shape the frontend expects: { captions, hashtags, emojis }
      captions: resultData.captions,
      hashtags: resultData.hashtags,
      emojis: resultData.emojis,
      // Extra metadata
      savedId: savedCaption ? savedCaption._id : null,
    });
  } catch (error) {
    console.error('Generate caption error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during caption generation.',
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get authenticated user's generation history
// @route   GET /api/captions/history
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [captions, total] = await Promise.all([
      Caption.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Caption.countDocuments({ userId: req.user._id }),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      captions,
    });
  } catch (error) {
    console.error('Get history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching history.',
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a saved caption generation
// @route   DELETE /api/captions/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const deleteCaption = async (req, res) => {
  try {
    const caption = await Caption.findById(req.params.id);

    if (!caption) {
      return res.status(404).json({
        success: false,
        message: 'Caption not found.',
      });
    }

    // Ensure the authenticated user owns this caption
    if (caption.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this caption.',
      });
    }

    await caption.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Caption deleted successfully.',
    });
  } catch (error) {
    console.error('Delete caption error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting caption.',
    });
  }
};

module.exports = { generateCaption, getHistory, deleteCaption };
