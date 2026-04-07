/**
 * Caption Generation Engine
 *
 * Generates platform-specific captions, hashtags, and emojis
 * based on the user's keywords, mood, and target platform.
 *
 * In production, replace this logic with an AI/LLM API call
 * (e.g., OpenAI GPT, Google Gemini, etc.)
 */

// ─── Mood Templates ───────────────────────────────────────────────────────────
const moodTemplates = {
  Funny: [
    "When life gives you {keywords}, make memes. 😂",
    "Me pretending to understand {keywords} like a pro 🤡",
    "Nobody asked but here's my {keywords} experience 😅",
    "Plot twist: {keywords} was just vibing all along 🤣",
    "Warning: {keywords} may cause uncontrollable laughter 😆",
  ],
  Romantic: [
    "Lost in the magic of {keywords} with you 💕",
    "Every moment with {keywords} feels like a fairy tale ✨",
    "You and {keywords} — my two favorite things 🌹",
    "In a world full of chaos, {keywords} is my calm 💫",
    "Let's write our love story with a chapter called {keywords} ❤️",
  ],
  Sad: [
    "Sometimes {keywords} hits different at 3am 🌙",
    "There's a certain sadness in {keywords} you can't explain 💧",
    "Missing what was, staring at {keywords} 😔",
    "The quiet kind of hurt — that's {keywords} 🖤",
    "{keywords} and nostalgia walking hand in hand 🍂",
  ],
  Motivational: [
    "Rise and grind — {keywords} won't achieve itself 💪",
    "Every great journey starts with {keywords} 🚀",
    "Your {keywords} era begins now. Don't look back 🔥",
    "Believe in the power of {keywords} — you've got this 🏆",
    "Small steps, big dreams — {keywords} is just the beginning ⭐",
  ],
  Professional: [
    "Excited to share my thoughts on {keywords} 📊",
    "Leveraging {keywords} to drive meaningful results 📈",
    "Insights on {keywords} that every professional should know 💼",
    "Innovation starts with understanding {keywords} 🎯",
    "Building the future through {keywords} — one step at a time 🌐",
  ],
};

// ─── Platform Hashtag Sets ────────────────────────────────────────────────────
const platformHashtags = {
  Instagram: ["#instagood", "#photooftheday", "#explore", "#viral", "#trending", "#instadaily", "#love", "#picoftheday"],
  WhatsApp: ["#status", "#whatsappstatus", "#dailyvibes", "#motivation", "#trending"],
  LinkedIn: ["#linkedin", "#professional", "#networking", "#career", "#success", "#innovation", "#leadership", "#growth"],
  Twitter: ["#trending", "#viral", "#twitterthread", "#dailythought", "#followme", "#retweet"],
};

// ─── Mood Emoji Sets ──────────────────────────────────────────────────────────
const moodEmojis = {
  Funny: ["😂", "🤣", "😅", "🤡", "😆", "💀", "🙈", "😜", "🤪", "😝"],
  Romantic: ["❤️", "💕", "🌹", "💫", "✨", "💑", "🥰", "😍", "💖", "🌸"],
  Sad: ["😢", "💧", "🖤", "😔", "🌧️", "🥀", "😞", "💔", "🌑", "😿"],
  Motivational: ["💪", "🔥", "🚀", "🏆", "⭐", "🎯", "✅", "💡", "🙌", "👊"],
  Professional: ["📊", "💼", "🎯", "📈", "🌐", "🤝", "💡", "✅", "📌", "🏅"],
};

// ─── Main Generator Function ──────────────────────────────────────────────────
const generateCaptionData = (keywords, mood, platform) => {
  const templates = moodTemplates[mood] || moodTemplates["Motivational"];
  const baseHashtags = platformHashtags[platform] || platformHashtags["Instagram"];
  const emojis = moodEmojis[mood] || moodEmojis["Motivational"];

  // Generate 3 unique captions from the templates
  const shuffledTemplates = [...templates].sort(() => Math.random() - 0.5);
  const captions = shuffledTemplates.slice(0, 3).map((template) =>
    template.replace(/{keywords}/g, keywords)
  );

  // Generate keyword hashtags from the input
  const keywordTags = keywords
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .map((w) => `#${w.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}`)
    .slice(0, 4);

  // Combine platform hashtags with keyword-derived hashtags (max 10)
  const allHashtags = [...keywordTags, ...baseHashtags]
    .filter((v, i, a) => a.indexOf(v) === i) // unique
    .slice(0, 10);

  // Pick 6 relevant emojis
  const selectedEmojis = emojis.slice(0, 6);

  return {
    captions,
    hashtags: allHashtags,
    emojis: selectedEmojis,
  };
};

module.exports = { generateCaptionData };
