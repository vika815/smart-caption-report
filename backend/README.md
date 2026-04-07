# Smart Caption Generator - Backend

## ⚙️ Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Edit `.env` and set:
- `MONGO_URI` → Your MongoDB connection string
- `JWT_SECRET` → A long random secret string

### 3. Start Server
```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

## 📡 API Endpoints

### Auth Routes (`/api/auth`)
| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/api/auth/signup` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| GET | `/api/auth/me` | Get current user profile | ✅ |

### Caption Routes (`/api/captions`)
| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/api/captions/generate` | Generate captions/hashtags/emojis | ✅ |
| GET | `/api/captions/history` | Get user's generation history | ✅ |
| DELETE | `/api/captions/:id` | Delete a saved generation | ✅ |

### Legacy Route (matches original App.js)
| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/generate` | Generate (no auth required — dev mode) | ❌ |

## 📦 Tech Stack
- **Runtime**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcryptjs
- **Logging**: Morgan
