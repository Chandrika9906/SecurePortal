# Secure Content Portal 🛡️

A production-quality full-stack **MERN (MongoDB, Express, React, Node.js)** internal organizational portal for securely accessing training videos, PDF documentation, and interactive HTML reference materials.

**Live Demo** → https://secure-portal-frontend.vercel.app

---

## 📋 What It Does

The Secure Content Portal is an enterprise knowledge management system with strict **server-side role-based access control (RBAC)**, **private cloud storage**, and **protected content delivery**. Sensitive assets are never exposed via direct URLs — every byte is gated behind an authenticated session.

### Role & Access Matrix

| Feature | VIEWER | ADMIN | Unauthenticated |
| :--- | :---: | :---: | :---: |
| Browse Content Library | ✅ | ✅ | ❌ 401 |
| Stream Video / View PDF / HTML | ✅ | ✅ | ❌ 401 |
| Admin Dashboard & Audit Trail | ❌ 403 | ✅ | ❌ 401 |
| Upload Content | ❌ 403 | ✅ | ❌ 401 |
| Edit Metadata | ❌ 403 | ✅ | ❌ 401 |
| Delete Content | ❌ 403 | ✅ | ❌ 401 |

---

## 🔒 Security Architecture

- **HttpOnly Cookie Sessions** — JWT stored in `HttpOnly`, `SameSite=Lax` cookies. No client-side JS can read the token.
- **Server-Side RBAC** — Every protected route runs `protect` + `adminOnly` middleware. Viewer hitting an admin endpoint gets `403` + audit log entry.
- **Private File Storage** — Files saved to `backend/private_uploads` (local) or a private Cloudinary bucket (production). Never accessible via a static public URL.
- **Protected Streaming** — All content delivered through `GET /api/content/:id/stream` after session verification.
  - **Video** — HTTP Range requests for smooth seeking without exposing file paths.
  - **PDF** — Inline binary stream with `X-Content-Type-Options: nosniff`.
  - **HTML** — Sandboxed `<iframe sandbox="allow-scripts">` isolated from parent DOM and cookies.
- **Server-Side Validation** — MIME type + file size (100 MB max) enforced on upload. Storage keys are random UUIDs.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | React 18, Vite, Tailwind CSS, Lucide Icons |
| Backend | Node.js, Express.js, Helmet, Cookie-Parser, Multer |
| Auth | Google OAuth 2.0 (via `google-auth-library`) + Demo login |
| Database | MongoDB Atlas (Mongoose) with in-memory fallback |
| Storage | Cloudinary (production) / Local FS (development) |
| Deployment | Render (backend) + Vercel (frontend) |

---

## 🚀 Local Development

### Prerequisites
- Node.js v18+
- NPM v9+

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd InternPortal

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment

**`backend/.env`** — copy from `.env.example` and fill:

```env
PORT=5000
MONGODB_URI=your-mongodb-atlas-uri
JWT_SECRET=any-random-32-char-string
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
ADMIN_EMAILS=your@gmail.com
CLIENT_URL=http://localhost:3000
NODE_ENV=development

# Cloudinary (optional for local, required for production)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**`frontend/.env`**:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 3. Run

```bash
# Terminal 1
cd backend && node server.js

# Terminal 2
cd frontend && npm run dev
```

Open `http://localhost:3000`

### 4. Demo accounts (no Google setup needed)

| Button | Email | Role |
| :--- | :--- | :--- |
| Demo Admin | admin@enterprise.com | ADMIN — upload, edit, delete, dashboard |
| Demo Viewer | viewer@enterprise.com | VIEWER — browse and stream only |

---

## 🔑 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create an **OAuth 2.0 Client ID** (Web Application)
3. Add to **Authorized JavaScript origins**: `http://localhost:3000`
4. Add to **Authorized redirect URIs**: `http://localhost:3000`
5. Copy the Client ID → paste into both `.env` files
6. Add your Gmail to `ADMIN_EMAILS` in `backend/.env` to get ADMIN role on sign-in

---

## ☁️ Cloudinary Setup (required for production uploads)

1. Sign up free at [cloudinary.com](https://cloudinary.com) (25 GB free tier)
2. Dashboard → copy **Cloud Name**, **API Key**, **API Secret**
3. Paste into `backend/.env` under the Cloudinary section

---

## 🌐 Deployment (Render + Vercel)

### Step 1 — Push to GitHub

```bash
git add .
git commit -m "ready for deployment"
git push
```

### Step 2 — Deploy Backend on Render

1. [render.com](https://render.com) → New Web Service → connect your GitHub repo
2. Settings:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Instance: **Free**
3. Add all `backend/.env` variables in Render → Environment (leave `CLIENT_URL` blank for now)
4. Deploy → copy your Render URL e.g. `https://your-app.onrender.com`

### Step 3 — Deploy Frontend on Vercel

1. [vercel.com](https://vercel.com) → New Project → import your repo
2. Settings:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add environment variable: `VITE_GOOGLE_CLIENT_ID=your-client-id`
4. Open `frontend/vercel.json` → replace `YOUR-RENDER-APP` with your actual Render URL
5. Deploy → copy your Vercel URL e.g. `https://your-app.vercel.app`

### Step 4 — Wire them together

- Render → Environment → set `CLIENT_URL=https://your-app.vercel.app` → redeploy
- Google Cloud Console → add `https://your-app.vercel.app` to Authorized Origins + Redirect URIs

---

## 🧪 Security Checklist

- [x] Google OAuth verification + HttpOnly cookie session
- [x] Demo login for reviewer testing without Google setup
- [x] Server-side RBAC — VIEWER hitting admin routes returns `403` + audit log
- [x] Files stored outside web root — no direct static URL access
- [x] Video range-request streaming
- [x] PDF inline binary stream (no download toolbar)
- [x] HTML sandboxed iframe (isolated from parent DOM/cookies)
- [x] Upload MIME + size validation
- [x] Admin dashboard with audit trail
- [x] Responsive — desktop table + mobile card layout
