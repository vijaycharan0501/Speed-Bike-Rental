# Speed Bike Rental

Full-stack motorcycle rental website, booking request platform with WhatsApp Click-to-Chat handoff, and protected Admin Portal built to **PRD Version 2.0**.

## Tech Stack

- **Frontend:** React 18, Vite, JavaScript (ES6+), Tailwind CSS, React Router, Lucide React, Recharts
- **Backend:** Node.js, Express.js, Zod validation, Multer, Helmet, CORS allowlist, Rate Limiting
- **Database:** MongoDB Atlas + Mongoose (schemas, validation, indexes, booking snapshots)
- **Media Storage:** Cloudinary (URLs and metadata persisted in MongoDB)
- **Authentication:** JWT stored in secure `HttpOnly` cookies + `X-CSRF-Token` double-submit protection (no tokens in `localStorage`)
- **Messaging:** WhatsApp Click-to-Chat (`wa.me`) prefilled with persisted booking details
- **Hosting:** Vercel (frontend) + Render (backend)

---

## Repository Structure

```text
speed-bike-rental/
├── backend/
│   ├── src/
│   │   ├── config/          # env, MongoDB connection, Cloudinary config
│   │   ├── controllers/     # Public & Admin REST API controllers
│   │   ├── middleware/      # JWT HttpOnly auth, CSRF, rate limiters, sanitize, Multer upload, error handler
│   │   ├── models/          # Admin, Bike, Customer, Booking, Review, ContactEnquiry, WebsiteSettings
│   │   ├── routes/          # /api/*, /api/admin/auth/*, /api/admin/*
│   │   ├── scripts/         # createAdmin.js, seedDemo.js
│   │   ├── services/        # bookingService (pricing + overlap checks), settingsService, uploadService
│   │   ├── utils/           # phone normalization, reference generator, slugify, WhatsApp builder
│   │   ├── validators/      # Zod schemas
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   │   └── api.test.js      # End-to-end API & security integration tests
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── demo/            # Clearly marked development demo images
│   │   └── favicon.svg      # Original speedometer SVG favicon
│   ├── src/
│   │   ├── admin/           # Login, Dashboard, Bikes, Bookings, Customers, Reviews, Reports, WebsiteContent, Settings
│   │   ├── components/      # BrandLogo, Navbar, Footer, BikeCard, PromoTicker, ImageUploader, StatusBadge, etc.
│   │   ├── context/         # SettingsContext, AuthContext
│   │   ├── hooks/           # useDocumentTitle
│   │   ├── layouts/         # PublicLayout, AdminLayout
│   │   ├── pages/           # Home, Bikes, BikeDetails, Booking, About, Contact, Terms, Privacy, NotFound
│   │   ├── routes/          # ProtectedRoute
│   │   ├── services/        # api.js (cookie + CSRF aware)
│   │   ├── styles/          # Tailwind CSS + design tokens + reduced-motion ticker
│   │   └── utils/           # formatters & WhatsApp URL helper
│   ├── vercel.json
│   └── package.json
├── .env.example
├── render.yaml
└── README.md
```

---

## Local Setup & Run Commands

### 1. Prerequisites
- Node.js 20+ and npm 10+
- MongoDB Atlas cluster (or local MongoDB instance)
- Cloudinary account (for image uploads)

### 2. Install Dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` into `backend/.env` and `frontend/.env` and fill in your real values (**never commit `.env`**):

**`backend/.env`:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/speed-bike-rental?retryWrites=true&w=majority
JWT_SECRET=replace-with-at-least-32-random-characters
JWT_EXPIRES_IN=7d
FRONTEND_ORIGINS=http://localhost:5173
COOKIE_SAME_SITE=lax
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER=speed-bike-rental
```

**`frontend/.env`:**
```env
# Leave empty in local development to use Vite's built-in /api proxy to localhost:5000
VITE_API_BASE_URL=
```

### 4. Create the First Admin Account (Secure Setup)

No admin credentials are hardcoded in the codebase. Run the interactive CLI script:

```bash
cd backend
npm run create-admin
```

Or pass one-time environment variables (e.g., on Render shell):

```bash
ADMIN_NAME="Owner Name" ADMIN_EMAIL="owner@yourdomain.com" ADMIN_PASSWORD="StrongUniquePassword123!" npm run create-admin
```

### 5. Optional: Seed Development Demo Bikes

To populate 5 clearly marked `[DEMO]` motorcycles for local preview (does **not** seed fake reviews or fabricated business contact info):

```bash
cd backend
npm run seed:demo
```

Replace or archive all demo bikes in **Admin → Manage Bikes** before going live.

### 6. Start the Application

In terminal 1 (Backend API on `http://localhost:5000`):
```bash
cd backend
npm run dev
```

In terminal 2 (Frontend Vite app on `http://localhost:5173`):
```bash
cd frontend
npm run dev
```

### 7. Run Automated Tests

```bash
cd backend
npm test
```

---

## MongoDB Atlas Setup

1. Create a free or dedicated cluster at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user with Read/Write permissions on the `speed-bike-rental` database.
3. Configure Network Access (add your development IP and Render outbound IPs or `0.0.0.0/0` with strong credentials).
4. Copy the Node.js connection string into `MONGODB_URI`.

---

## Cloudinary Setup

1. Create an account at [Cloudinary](https://cloudinary.com/).
2. From the Cloudinary Dashboard, copy **Cloud Name**, **API Key**, and **API Secret**.
3. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in `backend/.env` (and Render env vars).
4. Uploads are restricted server-side to JPEG, PNG, and WebP up to 5 MB each.

---

## Deployment Guide

### Backend on Render

1. Push this repository to GitHub.
2. In [Render](https://render.com/), create a **New Web Service** (or import `render.yaml` via Blueprint).
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
4. Set Environment Variables in Render:
   - `NODE_ENV=production`
   - `MONGODB_URI=<your-atlas-uri>`
   - `JWT_SECRET=<random-64-char-secret>`
   - `FRONTEND_ORIGINS=https://your-vercel-domain.vercel.app` (comma-separated if adding a custom domain)
   - `COOKIE_SAME_SITE=none` (required for cross-domain HttpOnly cookies between Vercel and Render over HTTPS)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
5. Open Render's Shell tab once deployed and run `npm run create-admin` to create your production owner login.

### Frontend on Vercel

1. In [Vercel](https://vercel.com/), import the GitHub repository.
2. Set **Root Directory** to `frontend` (Vite framework is auto-detected; `frontend/vercel.json` handles SPA rewrites).
3. Set Environment Variable:
   - `VITE_API_BASE_URL=https://your-render-service.onrender.com`
4. Deploy, then add your final Vercel URL to `FRONTEND_ORIGINS` on Render.

---

## Owner Setup Checklist (Before Production Launch)

Log in to `/admin` and configure:
1. **Settings:** Owner WhatsApp number (international format), business phone, email, showroom address, pickup locations, operating hours, Google Maps embed/link, currency symbol, social links, and revenue reporting rule.
2. **Manage Bikes:** Replace/archive all `[DEMO]` bikes with your real motorcycles, daily rates, verified specifications, and Cloudinary photos.
3. **Website Content:** Update Home hero copy/image, About Us story, mission/vision/maintenance standards, and review/replace the draft **Terms & Conditions** and **Privacy Policy** with owner-approved policies (including rental eligibility, required ID/license documents, deposit, late return, damage, and cancellation rules).
