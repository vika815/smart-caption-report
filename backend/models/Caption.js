const mongoose = require('mongoose');

const CaptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    keywords: {
      type: String,
      required: [true, 'Keywords are required'],
      trim: true,
    },
    mood: {
      type: String,
      required: [true, 'Mood is required'],
      enum: ['Funny', 'Romantic', 'Sad', 'Motivational', 'Professional'],
    },
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      enum: ['Instagram', 'WhatsApp', 'LinkedIn', 'Twitter'],
    },
    resultData: {
      captions: {
        type: [String],
        default: [],
      },
      hashtags: {
        type: [String],
        default: [],
      },
      emojis: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model('Caption', CaptionSchema);
