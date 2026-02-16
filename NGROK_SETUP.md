# Ngrok Configuration Guide

## Single Ngrok Setup (Frontend Only)

Since you only have one ngrok instance, we've configured Vite to proxy API requests to the backend.

### Architecture
```
Ngrok (public) → Vite Dev Server (port 3000) → Backend API (port 4000)
                      ↓
                   /api/* → http://localhost:4000
```

### Configuration

#### 1. Frontend Vite Config (`vite.config.ts`)
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:4000',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

#### 2. Frontend `.env`
```properties
# Use relative URL - Vite will proxy to backend
VITE_API_URL=/api
```

### Running the Application

#### Terminal 1: Backend (localhost only)
```bash
cd backend
bun run dev
# Backend runs on http://localhost:4000
```

#### Terminal 2: Frontend (exposed via ngrok)
```bash
cd frontend
bun run dev
# Frontend runs on http://localhost:3000
```

#### Terminal 3: Ngrok (expose frontend only)
```bash
ngrok http 3000
```

### How It Works

1. **Ngrok URL** (e.g., `https://abc123.ngrok.io`)
   - Public access to your frontend

2. **Frontend API calls** (`/api/*`)
   - Automatically proxied to `http://localhost:4000` by Vite
   - No CORS issues since it's same-origin from browser perspective

3. **Backend** (`localhost:4000`)
   - Only accessible locally
   - Receives proxied requests from Vite

### Testing

```bash
# From your browser (using ngrok URL)
fetch('https://abc123.ngrok.io/api/health')
  .then(r => r.json())
  .then(console.log)

# This automatically proxies to http://localhost:4000/api/health
```

### CORS Configuration

Update backend CORS to allow ngrok domain:

**`backend/.env`**
```properties
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,https://your-ngrok-url.ngrok.io
```

Or allow all for development:

**`backend/src/app.ts`**
```typescript
app.use(cors({
  origin: process.env.NODE_ENV === 'development' 
    ? '*' 
    : process.env.CORS_ORIGINS?.split(','),
  credentials: true
}));
```

### Alternative: Production Setup

If you need separate ngrok for backend (not recommended for development):

#### Terminal 1: Backend
```bash
cd backend
bun run dev
```

#### Terminal 2: Frontend
```bash
cd frontend
bun run dev
```

#### Terminal 3: Backend Ngrok
```bash
ngrok http 4000
# Get URL: https://backend123.ngrok.io
```

#### Terminal 4: Frontend Ngrok
```bash
ngrok http 3000
# Get URL: https://frontend456.ngrok.io
```

Then update:
```properties
# frontend/.env
VITE_API_URL=https://backend123.ngrok.io/api
```

But this requires 2 ngrok instances (and a paid plan).

---

## Recommended Setup (Current)

✅ **1 Ngrok** - Pointing to frontend (port 3000)
✅ **Vite Proxy** - Handles API requests to backend
✅ **No CORS Issues** - Same origin from browser perspective
✅ **Simple** - Only one public URL to share

### Start Everything

```bash
# Terminal 1: Backend
cd /home/rudeus/Projects/proptech/backend && bun run dev

# Terminal 2: Frontend  
cd /home/rudeus/Projects/proptech/frontend && bun run dev

# Terminal 3: Ngrok (point to frontend)
ngrok http 3000
```

Share the ngrok URL with testers/users. Everything will work! 🚀
