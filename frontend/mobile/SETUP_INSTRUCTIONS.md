# Smart Caption Generator - Setup Instructions

## 📱 React Native Expo App

### Prerequisites
- Node.js installed
- Expo Go app on your mobile device (Download from App Store/Play Store)

### Installation Steps

1. **Navigate to the project directory:**
   ```bash
   cd "c:\Users\Lenovo\OneDrive\Desktop\Mini projrct 1\frontend\mobile"
   ```

2. **Dependencies are already installed**, but if needed:
   ```bash
   powershell -ExecutionPolicy Bypass -Command "npm install"
   ```

### Configuration

**IMPORTANT:** Update the backend URL in `App.js`:

1. Open `App.js`
2. Find this line (around line 16):
   ```javascript
   const BACKEND_URL = 'http://192.168.1.100:5000';
   ```
3. Replace `192.168.1.100` with **YOUR PC's IP address**

**How to find your PC's IP:**
- Open Command Prompt
- Run: `ipconfig`
- Look for "IPv4 Address" under your active network adapter
- Example: `192.168.1.105`

### Running the App

1. **Start the Expo development server:**
   ```bash
   powershell -ExecutionPolicy Bypass -Command "npm start"
   ```

2. **Scan the QR code:**
   - Open **Expo Go** app on your phone
   - Scan the QR code that appears in the terminal
   - Make sure your phone and PC are on the **same WiFi network**

3. **Alternative methods:**
   - Press `a` for Android emulator (if installed)
   - Press `i` for iOS simulator (Mac only)
   - Press `w` for web browser

### App Features

#### 🔐 Authentication
- **Frontend-only authentication** (no real backend validation)
- Login and Signup with form validation
- Persistent login using AsyncStorage
- Google Sign-In button (shows "Coming soon" alert)

#### ✨ Caption Generator
- Enter keywords/topic for your post
- Select mood (Funny, Romantic, Sad, Motivational, Professional)
- Select platform (Instagram, WhatsApp, LinkedIn, Twitter)
- Optional image upload (UI only)
- Generate captions by calling backend API
- Copy captions, hashtags, and emojis to clipboard

#### 🎨 UI Features
- Modern glassmorphism design
- Gradient backgrounds
- Smooth animations
- Premium color scheme
- Responsive layout
- Copy-to-clipboard functionality

### Backend Connection

The app expects a backend API at:
```
POST http://YOUR_PC_IP:5000/generate
```

**Request body:**
```json
{
  "keywords": "sunset beach",
  "mood": "Romantic",
  "platform": "Instagram"
}
```

**Expected response:**
```json
{
  "captions": ["Caption 1", "Caption 2", "Caption 3"],
  "hashtags": ["#sunset", "#beach", "#love"],
  "emojis": ["🌅", "🏖️", "❤️"]
}
```

### Troubleshooting

1. **White screen or error?**
   - Clear the Expo cache: `powershell -ExecutionPolicy Bypass -Command "npx expo start -c"`

2. **Can't connect to backend?**
   - Verify your PC's IP address is correct in App.js
   - Make sure backend is running on port 5000
   - Ensure phone and PC are on same WiFi network
   - Check if firewall is blocking the connection

3. **Dependencies error?**
   - Delete `node_modules` folder
   - Run: `powershell -ExecutionPolicy Bypass -Command "npm install"`

4. **App crashes?**
   - Check the error in terminal
   - Restart Expo: Press `r` in terminal

### Testing Without Backend

The app will work for authentication without a backend. The generator will show an error alert when trying to generate captions if the backend is not available.

### File Structure

```
mobile/
├── App.js                     # Main app file (single-page app)
├── package.json              # Dependencies
├── app.json                  # Expo configuration
└── SETUP_INSTRUCTIONS.md     # This file
```

### Key Dependencies

- **expo** - React Native framework
- **expo-linear-gradient** - Gradient backgrounds
- **@react-native-async-storage/async-storage** - Persistent storage
- **axios** - HTTP requests
- **expo-image-picker** - Image selection
- **@expo/vector-icons** - Icons

---

Made with ❤️ for Smart Caption Generator
