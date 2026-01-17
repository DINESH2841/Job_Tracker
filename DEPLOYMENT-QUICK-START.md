# 🚀 Job Tracker - Production Deployment Checklist

## Your Domain Setup
- **Domain:** dineshsevenni.me
- **Frontend:** job-tracker.dineshsevenni.me
- **Backend API:** api.dineshsevenni.me
- **Platform:** Render

---

## Quick Start - 5 Steps

### 1️⃣ Push to GitHub
```bash
git add .
git commit -m "Ready for production"
git push origin main
```

### 2️⃣ Update Google OAuth (Production)
Go to [Google Cloud Console](https://console.cloud.google.com):
- Add redirect URIs:
  ```
  https://job-tracker.dineshsevenni.me/api/auth/callback/google
  https://api.dineshsevenni.me/auth/callback
  ```

### 3️⃣ Deploy on Render
1. Go to [render.com](https://render.com)
2. Click **New → Blueprint**
3. Connect GitHub repo
4. Render auto-detects `render.yaml`
5. Add environment variables (from `.env.production.example`)

### 4️⃣ Configure DNS
In your domain provider (dineshsevenni.me):
```
job-tracker  CNAME  <render-url>
api          CNAME  <render-backend-url>
```

### 5️⃣ Test
```bash
https://job-tracker.dineshsevenni.me  # Frontend
https://api.dineshsevenni.me/health   # Backend
```

---

## Environment Variables Needed

**Critical (keep these safe):**
- `NEXTAUTH_SECRET` - Generate: `openssl rand -base64 32`
- `JWT_SECRET` - Generate: `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID` - From Google Cloud
- `GOOGLE_CLIENT_SECRET` - From Google Cloud
- `FIREBASE_PRIVATE_KEY` - From Firebase

**Non-sensitive (can be public):**
- All `VITE_FIREBASE_*` keys
- `GOOGLE_CLIENT_ID` (this is public)

---

## Files Created

✅ `render.yaml` - Render deployment config
✅ `.env.production.example` - Production env template
✅ `DEPLOYMENT.md` - Detailed guide

---

## Next: Phase 2 Preparation

Before Phase 2 (Gmail integration), ensure:
- ✅ App deploys successfully
- ✅ OAuth sign-in works in production
- ✅ API calls work cross-domain
- ✅ Firebase is accessible from production

Then build:
1. Gmail email ingestion
2. Firestore data persistence
3. Background sync jobs
4. Analytics dashboard

---

Need help? Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
