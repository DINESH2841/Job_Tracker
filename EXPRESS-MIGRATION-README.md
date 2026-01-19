# 📋 Job Tracker - Express Migration Complete

A comprehensive job application tracking system with Gmail integration, now running on Express + MongoDB.

## 🎯 Quick Start

### For Local Development
👉 **[Local Development Setup](LOCAL-DEV-SETUP.md)** - Get running in 5 minutes

### For Production Deployment
👉 **[Express Migration Guide](MIGRATION-EXPRESS.md)** - Deploy to Render

### Documentation
- [What's New](EXPRESS-MIGRATION-SUMMARY.md) - See what was built
- [Verification Checklist](VERIFICATION-CHECKLIST.md) - Pre-deployment validation

## ✨ Key Features

- 🔐 **Google OAuth 2.0** - Secure authentication
- 📧 **Gmail Integration** - Auto-sync job applications from emails
- 📊 **Dashboard** - Track all applications in one place
- 🚀 **Production Ready** - Express + MongoDB on Render free tier
- 📱 **Responsive Design** - Works great on mobile

## 🏗️ Current Architecture

```
Frontend (Next.js) → Express Backend → MongoDB
       ↓
    OAuth Google → Gmail API
```

## 🚀 Technologies

- **Frontend**: Next.js 16, React 19, TailwindCSS, Axios
- **Backend**: Express.js, MongoDB with Mongoose
- **Auth**: Google OAuth 2.0 + JWT in httpOnly cookies
- **Hosting**: Render (free tier)

## 📁 Project Structure

```
Job_Tracker/
├── frontend/           # Next.js app
│   ├── app/            # Pages
│   ├── components/     # React components
│   └── lib/api.ts      # REST API client
├── backend/            # Express server
│   ├── src/
│   │   ├── routes/     # Auth, Gmail, Jobs endpoints
│   │   ├── models/     # User, Application schemas
│   │   └── middleware/ # Auth middleware
│   └── package.json
└── docs/               # This documentation
```

## 🔄 What Changed

### Before (Firebase)
- Cloud Functions (serverless)
- Firestore database
- Firebase Auth SDK
- Firebase callable functions

### After (Express) ✅
- Express.js server
- MongoDB database
- Google OAuth 2.0 + JWT
- REST API with axios

## 🚦 Deployment Status

### ✅ Development Complete
- Express backend with all routes
- MongoDB models
- Frontend REST API client
- Auth provider without Firebase

### 📋 Ready for Production
1. Set up MongoDB Atlas free cluster
2. Create Google OAuth credentials
3. Deploy to Render (2 services)
4. Update DNS records
5. Test production flow

**See [MIGRATION-EXPRESS.md](MIGRATION-EXPRESS.md) for step-by-step deployment.**

## 🔐 Security

- JWT tokens in httpOnly secure cookies
- CORS configured for production domains
- User ownership checks on all protected routes
- No credentials in code

## 📊 Database

- **MongoDB Atlas** free M0 tier (adequate for MVP)
- Collections: `users`, `applications`
- Automatic backups

## 📝 Environment Variables

### Backend
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-32-char-secret
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://api.dineshsevinni.me/auth/callback
FRONTEND_URL=https://job-tracker.dineshsevinni.me
```

### Frontend
```env
NEXT_PUBLIC_API_URL=https://api.dineshsevinni.me
```

## 🧪 Testing

```bash
# Local development
npm run dev  # Backend (port 4000)
npm run dev  # Frontend (port 3000)

# Test flow:
1. Visit http://localhost:3000
2. Click "Continue with Google"
3. Grant permissions
4. Dashboard loads
5. Click "Gmail Settings"
6. Connect Gmail → Sync Now
7. Applications appear in table
```

## 🚀 One-Click Deployment

Ready to deploy? Follow [MIGRATION-EXPRESS.md](MIGRATION-EXPRESS.md):
1. Create MongoDB Atlas cluster (2 min)
2. Get Google OAuth credentials (2 min)
3. Create Render services (5 min)
4. Set environment variables (2 min)
5. Deploy (automatic via git push)

## 🆘 Troubleshooting

### Common Issues
- **CORS errors** → Check FRONTEND_URL env var
- **MongoDB connection failed** → Verify connection string
- **OAuth redirect fails** → Update redirect URI in Google Console
- **JWT errors** → Ensure JWT_SECRET is set on backend

**Full troubleshooting:** See [MIGRATION-EXPRESS.md](MIGRATION-EXPRESS.md#troubleshooting)

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| [LOCAL-DEV-SETUP.md](LOCAL-DEV-SETUP.md) | Get running locally |
| [MIGRATION-EXPRESS.md](MIGRATION-EXPRESS.md) | Deploy to production |
| [EXPRESS-MIGRATION-SUMMARY.md](EXPRESS-MIGRATION-SUMMARY.md) | What was built |
| [VERIFICATION-CHECKLIST.md](VERIFICATION-CHECKLIST.md) | Pre-deployment validation |

## 🎯 Next Steps

1. **Local Testing**: Follow [LOCAL-DEV-SETUP.md](LOCAL-DEV-SETUP.md)
2. **Production Setup**: Follow [MIGRATION-EXPRESS.md](MIGRATION-EXPRESS.md)
3. **Verify Everything**: Use [VERIFICATION-CHECKLIST.md](VERIFICATION-CHECKLIST.md)
4. **Deploy**: Push to Render, watch logs

## 📞 Support

All documentation is self-contained in markdown files:
- For local dev issues → LOCAL-DEV-SETUP.md
- For deployment issues → MIGRATION-EXPRESS.md
- For validation → VERIFICATION-CHECKLIST.md

## 📜 License

MIT

---

**Last Updated**: After Express migration completion  
**Status**: Ready for production deployment  
**Confidence Level**: High - All components integrated and tested
