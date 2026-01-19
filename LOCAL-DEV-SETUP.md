# Local Development Setup - Express Migration

## Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally (or MongoDB Atlas connection string)
- Google OAuth 2.0 credentials

### Step 1: Set Up Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file with local development values
cat > .env << EOF
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/job-tracker
JWT_SECRET=dev-secret-only-change-in-production
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:4000/auth/callback
FRONTEND_URL=http://localhost:3000
EOF

# Start backend (will watch for changes)
npm run dev
```

Backend should now be running on `http://localhost:4000`

### Step 2: Set Up Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:4000
EOF

# Start frontend (will watch for changes)
npm run dev
```

Frontend should now be running on `http://localhost:3000`

### Step 3: Test the Flow

1. Open `http://localhost:3000`
2. Click "Continue with Google"
3. You'll be redirected to `http://localhost:4000/auth/google`
4. Select a Google account and grant permissions
5. You'll be redirected back to `http://localhost:3000/dashboard`
6. You should see "Loading..." then your email displayed

### Step 4: Test Gmail Integration

1. On dashboard, click "Gmail Settings"
2. Click "Connect Gmail"
3. Grant gmail.readonly permission
4. Click "Sync Now"
5. Check console for synced emails

## Database Setup

### Option 1: Local MongoDB

```bash
# Install MongoDB Community Edition
# https://docs.mongodb.com/manual/installation/

# Start MongoDB service
# Windows (in PowerShell as Admin):
mongod

# Or use Docker:
docker run -d -p 27017:27017 --name mongodb mongo
```

### Option 2: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create free M0 cluster
4. Click "Connect" → "Connect your application"
5. Copy connection string
6. Update `MONGODB_URI` in `.env` with your connection string

## Google OAuth Setup

### For Local Development

1. Go to https://console.cloud.google.com/
2. Create or select your project
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Choose "Web application"
6. Add "Authorized redirect URIs":
   - `http://localhost:4000/auth/callback`
   - `http://localhost:3000`
7. Copy Client ID and Client Secret
8. Update `.env` files with these values

## Common Issues

### "Cannot find module 'mongodb'"
```bash
cd backend
npm install
```

### "Connection to MongoDB failed"
- Check if MongoDB is running: `mongod --version`
- Check connection string in `.env`
- For Atlas: verify IP whitelist includes your machine

### "Invalid grant for Google OAuth"
- Redirect URI must match exactly
- Check console for the actual redirect URL being used
- Update redirect URI in Google Cloud Console if different

### CORS errors in browser
- Check `FRONTEND_URL` env var matches your frontend URL
- Verify `credentials: true` in axios client
- Check browser console for exact error

### "JWT verification failed"
- JWT_SECRET must be same on both routes
- Clear browser cookies and try again
- Check token expiration (7 days)

## Debugging

### Backend Logs
```bash
# Terminal shows all Express logs automatically
# Look for "Server running on port 4000"
```

### Frontend Logs
```bash
# Browser console shows React/Next.js logs
# Check Network tab in DevTools for API calls
```

### Database Logs (MongoDB Atlas)
1. Go to MongoDB Atlas dashboard
2. Click cluster → "Collections"
3. Check `users` and `applications` collections
4. View documents created during testing

### Debugging Auth Flow
```bash
# Check cookies in browser
# DevTools → Application → Cookies → localhost:3000
# Should see "token" cookie with JWT value
```

## Commands Reference

### Backend
```bash
npm run dev      # Start development server with hot reload
npm run build    # Compile TypeScript to JavaScript
npm start        # Run compiled backend
npm test         # Run tests (if configured)
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Create production build
npm start        # Run production build
npm run lint     # Check for code issues
```

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads on http://localhost:3000
- [ ] Can click Google login button
- [ ] Google consent screen appears
- [ ] Gets redirected back to dashboard after login
- [ ] User email displayed in dashboard
- [ ] Can click "Gmail Settings"
- [ ] Can click "Connect Gmail"
- [ ] Gmail sync works and shows success message
- [ ] Can see applications in dashboard table

## Next Steps

1. Test all features locally
2. Follow `MIGRATION-EXPRESS.md` for Render deployment
3. Set up production environment variables
4. Deploy backend first, then frontend
5. Test production URLs with real domains

## Support

For issues:
1. Check error message in console
2. Verify environment variables are set
3. Ensure backend and frontend are both running
4. Clear browser cache and cookies
5. Check `MIGRATION-EXPRESS.md` troubleshooting section
