const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable the Cross-Origin-Opener-Policy middleware that Metro adds by default
// This allows the Google OAuth popup window to communicate with the main application
// when returning from authentication.
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware, server) => {
    return (req, res, next) => {
      // Force these headers to 'unsafe-none' to allow the popup to communicate with the opener
      res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
      res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');

      const originalSetHeader = res.setHeader;
      res.setHeader = function (name, value) {
        if (name.toLowerCase() === 'cross-origin-opener-policy' || name.toLowerCase() === 'cross-origin-embedder-policy') {
          return originalSetHeader.call(this, name, 'unsafe-none');
        }
        return originalSetHeader.call(this, name, value);
      };

      return middleware(req, res, next);
    };
  },
};


module.exports = config;
