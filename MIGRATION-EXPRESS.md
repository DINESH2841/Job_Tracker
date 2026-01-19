# Firebase → Express Migration Guide

## Overview
This document outlines the migration from Firebase Functions + Firestore to Express.js + MongoDB for production deployment.

## Architecture Changes

### Before (Firebase)
- **Frontend**: Next.js with Firebase Auth SDK, callable functions
- **Backend**: Cloud Functions v2 (serverless)
- **Database**: Firestore with collections/documents
- **Auth**: Firebase Authentication + custom JWT
- **Session**: Firebase Auth tokens + httpOnly cookies

### After (Express)
- **Frontend**: Next.js with REST API client (axios)
- **Backend**: Node.js + Express on Render
- **Database**: MongoDB Atlas (free M0 tier)
- **Auth**: Google OAuth 2.0 → JWT tokens → httpOnly cookies
- **Session**: JWT verified on every protected request

## Step-by-Step Deployment

### 1. Database Setup (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free M0 cluster
3. Click "Connect" → "Connect your application"
4. Copy connection string: `mongodb+srv://username:password@cluster.mongodb.net/job-tracker?retryWrites=true&w=majority`
5. Set as `MONGODB_URI` in Render backend environment variables

### 2. Google OAuth 2.0 Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select your project
3. Navigate to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth 2.0 Client ID"
5. Select "Web application"
6. Add Authorized Redirect URI: `https://api.dineshsevinni.me/auth/callback`
7. Copy **Client ID** and **Client Secret**

### 3. Backend Service (Render)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Create new **Web Service**
3. Connect GitHub repo
4. Configure:
   - **Name**: `job-tracker-api`
   - **Region**: Frankfurt (closest to you)
   - **Runtime**: Node
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
5. Add environment variables:
   ```
   NODE_ENV=production
   PORT=4000
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=[generated 32-char random string]
   GOOGLE_CLIENT_ID=[from Google Console]
   GOOGLE_CLIENT_SECRET=[from Google Console]
   GOOGLE_REDIRECT_URI=https://api.dineshsevinni.me/auth/callback
   FRONTEND_URL=https://job-tracker.dineshsevinni.me
   ```
6. Deploy

### 4. Frontend Service (Render)

1. Create another **Web Service** for frontend
2. Configure:
   - **Name**: `job-tracker-web`
   - **Runtime**: Node
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Start Command**: `cd frontend && npm start`
3. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://api.dineshsevinni.me
   ```
4. Deploy
5. Set custom domain: `job-tracker.dineshsevinni.me`

### 5. DNS Configuration

Point your domain to Render:

1. Add CNAME record for `api.dineshsevinni.me` → Render backend service URL
2. Add CNAME record for `job-tracker.dineshsevinni.me` → Render frontend service URL
3. Wait 24 hours for propagation

## Code Changes Summary

### Backend Changes
- ✅ Express server setup with middleware
- ✅ MongoDB models (User, Application)
- ✅ JWT + httpOnly cookie auth
- ✅ Google OAuth 2.0 flow
- ✅ Gmail sync endpoint
- ✅ REST API routes (/auth, /gmail, /jobs)

### Frontend Changes
- ✅ Removed Firebase Auth SDK
- ✅ REST API client (axios)
- ✅ Session management via `/auth/me`
- ✅ Updated all components to use REST endpoints
- ✅ Updated login flow to redirect to `/auth/google`

## Testing Checklist

### Local Development
1. Start backend: `npm run dev` (backend folder)
2. Start frontend: `npm run dev` (frontend folder)
3. Set env vars in `.env.local`:
   ```
   # Backend
   MONGODB_URI=mongodb://localhost:27017/job-tracker
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_REDIRECT_URI=http://localhost:4000/auth/callback
   JWT_SECRET=dev-secret-only
   FRONTEND_URL=http://localhost:3000
   
   # Frontend
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

### Test Flow
1. Visit `http://localhost:3000`
2. Click "Continue with Google"
3. Redirect to Google OAuth → backend callback
4. Redirect back to `/dashboard`
5. Click "Gmail Settings"
6. Click "Connect Gmail" → consent screen
7. Click "Sync Now" → fetch emails
8. Verify applications appear in dashboard

### Production Checks
1. Test OAuth flow with production URLs
2. Verify cookies are httpOnly + secure
3. Test `/auth/me` protected endpoint
4. Verify CORS headers allow frontend domain
5. Check MongoDB connection string is correct
6. Verify JWT_SECRET is strong (32+ chars)

## Troubleshooting

### CORS errors
- Check `FRONTEND_URL` env var matches frontend domain
- Verify `credentials: true` in axios client

### JWT errors
- Ensure `JWT_SECRET` is set and identical on backend
- Check token expiration (7 days default)
- Verify `authMiddleware` is applied to protected routes

### MongoDB errors
- Test connection string with MongoDB Compass
- Whitelist Render IP in MongoDB Atlas
- Ensure `MONGODB_URI` includes database name

### OAuth errors
- Verify redirect URI matches exactly: `https://api.dineshsevinni.me/auth/callback`
- Check Google Client ID and Secret are correct
- Verify user has not revoked permissions

## Rollback Plan

If issues occur:
1. Keep old Firebase functions deployed in parallel
2. Route traffic via environment variable
3. Switch `NEXT_PUBLIC_API_URL` back to old endpoint
4. Gradually migrate users after fixes

## Monitoring

### Render Logs
- View real-time backend logs in Render dashboard
- Frontend logs available in Render Web Service logs

### Database Monitoring
- MongoDB Atlas provides built-in monitoring
- Set up alerts for connection issues

### Application Monitoring
- Add error tracking (Sentry) in future
- Monitor API response times

## Post-Migration

1. Decommission Firebase Functions
2. Archive old Firestore data
3. Monitor application stability for 1 week
4. Remove Firebase dependencies from package.json
5. Update documentation

## Support

For issues:
1. Check Render service logs
2. Verify environment variables
3. Test with `curl` to isolate frontend vs backend
4. Check MongoDB Atlas connection status
