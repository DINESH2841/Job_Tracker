# Deployment Guide for Job Tracker

## Overview
This guide covers deploying the Job Tracker application to various cloud platforms.

## Prerequisites
- PostgreSQL database
- Google OAuth credentials
- Environment variables configured

## Option 1: Vercel (Recommended)

### Steps:
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

5. Run database migrations:
   ```bash
   npx prisma db push
   ```

### Vercel Configuration
Create `vercel.json`:
```json
{
  "buildCommand": "prisma generate && next build",
  "framework": "nextjs"
}
```

## Option 2: Render

### Steps:
1. Create new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node

4. Add environment variables in Render dashboard

5. Create PostgreSQL database in Render and link it

## Option 3: AWS

### Using AWS Amplify:
1. Push code to GitHub
2. Go to AWS Amplify Console
3. Connect repository
4. Configure build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
           - npx prisma generate
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

5. Add environment variables
6. Deploy

### Using Elastic Beanstalk:
1. Install EB CLI
2. Initialize: `eb init`
3. Create environment: `eb create`
4. Deploy: `eb deploy`

## Database Setup

### PostgreSQL on Render:
1. Create PostgreSQL database in Render
2. Copy connection string
3. Add to `DATABASE_URL` environment variable

### PostgreSQL on AWS RDS:
1. Create RDS PostgreSQL instance
2. Configure security groups
3. Copy connection string
4. Add to environment variables

### Supabase (Alternative):
1. Create project on [Supabase](https://supabase.com)
2. Get connection string from settings
3. Use in `DATABASE_URL`

## Environment Variables

Required variables for production:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Gmail API (optional)
GMAIL_API_KEY="your-api-key"
```

## Post-Deployment Steps

1. **Initialize Database**:
   ```bash
   npx prisma db push
   ```

2. **Verify OAuth Callbacks**:
   - Add production URLs to Google OAuth settings
   - Test authentication flow

3. **Check Logs**:
   - Monitor application logs
   - Verify email syncing works

4. **Performance Testing**:
   - Test dashboard load times
   - Verify email processing speed

## Monitoring

### Vercel:
- Built-in analytics
- Function logs
- Performance metrics

### Render:
- Application logs in dashboard
- Metrics tab for performance

### AWS:
- CloudWatch for logs
- X-Ray for tracing
- CloudWatch Metrics

## Scaling Considerations

1. **Database Connection Pooling**:
   ```typescript
   // Add to prisma/schema.prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
     connection_limit = 10
   }
   ```

2. **Background Jobs**:
   - Use queue system for email processing
   - Consider Redis for job management

3. **Caching**:
   - Redis for session storage
   - CDN for static assets

## Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] OAuth callbacks restricted
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers set

## Troubleshooting

### Database Connection Issues:
- Verify connection string format
- Check IP whitelisting
- Confirm database credentials

### OAuth Errors:
- Verify redirect URIs match exactly
- Check OAuth consent screen configuration
- Ensure scopes are correct

### Build Failures:
- Clear build cache
- Check Node.js version
- Verify all dependencies installed

## Cost Estimation

### Vercel:
- Hobby: Free (sufficient for personal use)
- Pro: $20/month

### Render:
- Starter: $7/month web service
- Standard: $25/month PostgreSQL

### AWS:
- Amplify: ~$5-20/month
- RDS: ~$15-50/month depending on instance

## Backup Strategy

1. **Database Backups**:
   - Enable automatic backups on hosting platform
   - Export data regularly with `pg_dump`

2. **Code Backups**:
   - GitHub repository (primary)
   - Local clone (secondary)

## CI/CD Pipeline

### GitHub Actions Example:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx prisma generate
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

## Support

For deployment issues:
1. Check deployment platform logs
2. Review this guide
3. Open GitHub issue
4. Contact platform support
