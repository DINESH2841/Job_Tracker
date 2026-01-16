# Setup Guide - Job Tracker Application

## Quick Start

This guide will help you set up the Job Tracker application locally for development or production deployment.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **PostgreSQL** database ([Download](https://www.postgresql.org/download/) or use cloud service)
- **Google Cloud account** for OAuth and Gmail API
- **Git** for version control

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/DINESH2841/Job_Tracker.git
cd Job_Tracker
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js for the framework
- React for the UI
- Prisma for database access
- NextAuth for authentication
- Tailwind CSS for styling
- And more...

### 3. Set Up PostgreSQL Database

#### Option A: Local PostgreSQL

1. Install PostgreSQL on your system
2. Create a new database:
```bash
createdb job_tracker
```

3. Your connection string will be:
```
postgresql://username:password@localhost:5432/job_tracker
```

#### Option B: Cloud Database (Recommended for Production)

**Using Render:**
1. Sign up at [render.com](https://render.com)
2. Create a new PostgreSQL database
3. Copy the internal connection string

**Using Supabase:**
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string

**Using Neon:**
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

### 4. Configure Google OAuth & Gmail API

#### Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - **Gmail API**
   - **Google+ API** (for user info)

#### Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Choose **Web application**
4. Configure:
   - **Name**: Job Tracker
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google`
     - `http://localhost:3000/api/gmail/callback`
     - `https://yourdomain.com/api/auth/callback/google` (for production)
     - `https://yourdomain.com/api/gmail/callback` (for production)

5. Click **Create**
6. Save the **Client ID** and **Client Secret**

#### Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (or Internal if using Google Workspace)
3. Fill in required information:
   - **App name**: Job Tracker
   - **User support email**: your email
   - **Developer contact email**: your email
4. Add scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `.../auth/gmail.readonly`
5. Save and continue

### 5. Create Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/job_tracker"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Google OAuth Credentials
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

#### Generate NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and paste it as your `NEXTAUTH_SECRET` value.

### 6. Initialize Database

Run Prisma migrations to create the database schema:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push
```

To view your database in a browser:

```bash
npx prisma studio
```

This opens a GUI at `http://localhost:5555` where you can view and edit your data.

### 7. Run Development Server

Start the Next.js development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 8. Test the Application

1. Open [http://localhost:3000](http://localhost:3000)
2. Click "Get Started"
3. Sign in with Google
4. Link a Gmail account
5. Sync emails to see job applications

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

**Error**: `Can't reach database server`

**Solution**:
- Check if PostgreSQL is running
- Verify DATABASE_URL is correct
- Ensure database exists
- Check firewall settings

#### 2. OAuth Errors

**Error**: `redirect_uri_mismatch`

**Solution**:
- Verify redirect URIs in Google Cloud Console match exactly
- Include both `/api/auth/callback/google` and `/api/gmail/callback`
- No trailing slashes
- Match protocol (http/https)

**Error**: `invalid_client`

**Solution**:
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
- Ensure no extra spaces or newlines
- Re-download credentials from Google Cloud Console

#### 3. Build Errors

**Error**: `Module not found`

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

**Error**: `Prisma Client not generated`

**Solution**:
```bash
npx prisma generate
```

#### 4. Gmail API Errors

**Error**: `Failed to fetch emails`

**Solution**:
- Verify Gmail API is enabled in Google Cloud Console
- Check OAuth scopes include `gmail.readonly`
- Ensure access token is not expired
- Try re-linking the Gmail account

### Development Tips

#### Hot Reload

Next.js supports hot module replacement. Changes to code will automatically reload in the browser.

#### Database Changes

After modifying `prisma/schema.prisma`:

```bash
npx prisma generate  # Regenerate client
npx prisma db push   # Update database
```

#### Viewing Logs

Development server logs appear in the terminal. For more detailed logs:

```bash
DEBUG=* npm run dev
```

#### Testing OAuth Locally

If Google OAuth doesn't work on `localhost`, add your email to test users:
1. Go to OAuth consent screen in Google Cloud Console
2. Add test users
3. Add your email address

## Next Steps

Once your development environment is set up:

1. **Customize the UI**: Modify components in `components/` directory
2. **Add Features**: Extend API routes in `app/api/`
3. **Enhance AI**: Improve extraction logic in `lib/gmail/gmail-service.ts`
4. **Add Tests**: Create tests for your components and APIs
5. **Deploy**: Follow the [DEPLOYMENT.md](./DEPLOYMENT.md) guide

## Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Prisma Documentation**: https://www.prisma.io/docs
- **NextAuth.js Documentation**: https://next-auth.js.org/
- **Gmail API Documentation**: https://developers.google.com/gmail/api
- **Tailwind CSS Documentation**: https://tailwindcss.com/docs

## Getting Help

- Check existing [GitHub Issues](https://github.com/DINESH2841/Job_Tracker/issues)
- Create a new issue for bugs or feature requests
- Review the README.md for more information

## Development Workflow

```bash
# 1. Create a new branch
git checkout -b feature/my-feature

# 2. Make changes and test
npm run dev

# 3. Run linting
npm run lint

# 4. Build to check for errors
npm run build

# 5. Commit changes
git add .
git commit -m "Add my feature"

# 6. Push to GitHub
git push origin feature/my-feature

# 7. Create Pull Request
```

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_URL` | Application URL | Yes | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret for JWT signing | Yes | Generated with openssl |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes | `GOCSPX-xxx` |

## Security Checklist

Before deploying to production:

- [ ] Change NEXTAUTH_SECRET to a strong random value
- [ ] Use HTTPS for production URLs
- [ ] Restrict OAuth redirect URIs to production domain
- [ ] Enable rate limiting
- [ ] Set up database backups
- [ ] Configure CORS properly
- [ ] Add security headers
- [ ] Enable logging and monitoring

## Support

For questions or issues:
- 📧 Email: [Your Email]
- 💬 GitHub Issues: [Create an issue](https://github.com/DINESH2841/Job_Tracker/issues)
- 📖 Documentation: See README.md

---

Happy coding! 🚀
