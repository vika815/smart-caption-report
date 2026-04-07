# Smart Caption Generator — Project Report

## 1. Project Overview
The **Smart Caption Generator** is a cross-platform mobile application built to solve the "blank screen" problem for social media creators. By leveraging user keywords, the app automatically generates high-engagement captions, relevant hashtags, and appropriate emojis tailored for specific platforms and moods.

## 2. Key Features
*   **AI-Driven Content Creation**: Generates multiple caption variations based on user keywords and selected tones.
*   **Multi-Platform Optimization**: Specialized logic for Instagram, WhatsApp, LinkedIn, and Twitter.
*   **Mood-Based Personalization**: Offers 5 distinct emotional tones (Funny, Romantic, Sad, Motivational, and Professional).
*   **Secure Authentication**: Supports traditional Email/Password login and seamless **Google OAuth 2.0** integration.
*   **Global History**: Stores all previously generated content so users can revisit and copy them anytime.
*   **Dynamic UI**: Modern, high-performance interface with glassmorphism effects and smooth animations.

## 3. Technology Stack

### Frontend (Mobile App)
*   **Framework**: React Native with **Expo SDK**.
*   **Navigation**: Expo Router (File-based routing system).
*   **State Management**: React Hooks & Context API.
*   **Styling**: Custom CSS-in-JS for premium visuals (Gradients, Blur, Animations).
*   **Storage**: `AsyncStorage` for local persistence.

### Backend (Server)
*   **Environment**: Node.js & Express.
*   **Authentication**: JWT (JSON Web Tokens) & Google OAuth 2.0.
*   **Database Integration**: Mongoose (ODM for MongoDB).
*   **Security**: `bcryptjs` for password hashing and environment variables for secret keys.

### Database
*   **Cloud Host**: MongoDB Atlas.
*   **Storage Model**: NoSQL (Flexible JSON-like documents).

---

## 4. Database Schema

### User Collection
| Field | Type | Description |
| :--- | :--- | :--- |
| `fullName` | String | User's preferred name |
| `email` | String | Unique login identifier |
| `password` | String | Hashed secret (not used for Google users) |
| `googleId` | String | Unique ID from Google OAuth |
| `authProvider` | String | 'local' or 'google' |

### Caption Collection
| Field | Type | Description |
| :--- | :--- | :--- |
| `userId` | ObjectId | Reference to the generating user |
| `keywords` | String | Input keywords provided by user |
| `mood` | String | Tone selection (e.g., Funny, Professional) |
| `platform` | String | Target platform (e.g., Instagram, LinkedIn) |
| `resultData` | Object | JSON containing captions, hashtags, and emojis |

---

## 5. System Architecture
1.  **Frontend Request**: User enters keywords and mood, clicks "Generate".
2.  **Auth Layer**: Request is verified via JWT Middleware.
3.  **Generation Engine**: The backend Processes inputs through a template/logic engine (prepared for LLM integration).
4.  **Database Sync**: Results are saved for history before being returned to the user.
5.  **Frontend Display**: The app parses the JSON response and displays cards with "Copy to Clipboard" functionality.

## 6. Deployment Status
*   **Database**: Live on **MongoDB Atlas** (Cloud).
*   **Backend**: Deployed on **Render.com**.
*   **Frontend**: Configured for **Vercel** (Web) and **Expo EAS** (Mobile APK).

---
*Report Generated: April 7, 2026*
