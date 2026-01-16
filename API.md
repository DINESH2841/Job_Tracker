# API Documentation

## Overview

The Job Tracker API provides endpoints for managing job applications, Gmail accounts, authentication, and more.

**Base URL**: `http://localhost:3000/api` (development)

**Authentication**: Most endpoints require authentication via NextAuth.js session cookies.

## Table of Contents

- [Authentication](#authentication)
- [Gmail Accounts](#gmail-accounts)
- [Job Applications](#job-applications)
- [Analytics](#analytics)
- [Error Handling](#error-handling)

---

## Authentication

### Sign In

**POST** `/api/auth/signin`

Sign in with credentials or OAuth provider.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**: Redirect to dashboard on success

---

### Sign Out

**POST** `/api/auth/signout`

Sign out the current user.

**Response**: Redirect to home page

---

## Gmail Accounts

### Link Gmail Account

**GET** `/api/gmail/link`

Initiates OAuth flow to link a new Gmail account.

**Authentication**: Required

**Response**: Redirects to Google OAuth consent screen

---

### OAuth Callback

**GET** `/api/gmail/callback?code={code}&state={userId}`

Handles OAuth callback from Google.

**Query Parameters**:
- `code`: Authorization code from Google
- `state`: User ID for account linking

**Response**: Redirects to Gmail accounts page with success/error message

---

### Toggle Account Status

**PATCH** `/api/gmail/{accountId}/toggle`

Enable or disable email syncing for a Gmail account.

**Authentication**: Required

**Path Parameters**:
- `accountId`: Gmail account ID

**Request Body**:
```json
{
  "enabled": true
}
```

**Response**:
```json
{
  "id": "acc_123",
  "userId": "user_123",
  "email": "user@gmail.com",
  "enabled": true,
  "lastSyncAt": "2026-01-15T10:30:00.000Z",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-15T10:30:00.000Z"
}
```

---

### Delete Gmail Account

**DELETE** `/api/gmail/{accountId}`

Remove a linked Gmail account.

**Authentication**: Required

**Path Parameters**:
- `accountId`: Gmail account ID

**Response**:
```json
{
  "success": true
}
```

---

### Sync Emails

**POST** `/api/gmail/{accountId}/sync`

Trigger email sync for a Gmail account.

**Authentication**: Required

**Path Parameters**:
- `accountId`: Gmail account ID

**Response**:
```json
{
  "success": true,
  "processed": 150,
  "newApplications": 25
}
```

**Process**:
1. Fetches up to 100 recent job-related emails
2. Extracts company, role, status, date from each email
3. Creates job application records with confidence scores
4. Skips already processed emails
5. Returns count of processed and new applications

---

## Job Applications

### List Applications

**GET** `/api/applications`

Get all job applications for the authenticated user.

**Authentication**: Required

**Query Parameters**:
- `status` (optional): Filter by status (APPLIED, INTERVIEW, etc.)
- `search` (optional): Search by company or role
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 50, max: 100)

**Response**:
```json
{
  "applications": [
    {
      "id": "app_123",
      "companyName": "Google",
      "jobRole": "Software Engineer",
      "applicationDate": "2026-01-10T00:00:00.000Z",
      "status": "INTERVIEW",
      "companyConfidence": "HIGH",
      "roleConfidence": "HIGH",
      "dateConfidence": "HIGH",
      "hasReferral": false,
      "needsReview": false,
      "gmailAccount": {
        "email": "user@gmail.com"
      },
      "timeline": [
        {
          "eventType": "APPLICATION_SUBMITTED",
          "eventDate": "2026-01-10T00:00:00.000Z"
        },
        {
          "eventType": "STATUS_UPDATED",
          "status": "INTERVIEW",
          "eventDate": "2026-01-15T00:00:00.000Z"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

---

### Get Application

**GET** `/api/applications/{applicationId}`

Get details of a specific application.

**Authentication**: Required

**Path Parameters**:
- `applicationId`: Job application ID

**Response**:
```json
{
  "id": "app_123",
  "companyName": "Google",
  "jobRole": "Software Engineer",
  "applicationDate": "2026-01-10T00:00:00.000Z",
  "applicationSource": "LinkedIn",
  "status": "INTERVIEW",
  "hasReferral": true,
  "referralName": "John Doe",
  "referralPlatform": "LinkedIn",
  "companyConfidence": "HIGH",
  "roleConfidence": "HIGH",
  "dateConfidence": "HIGH",
  "emailSubject": "Your application to Google",
  "emailSender": "noreply@google.com",
  "emailBody": "Thank you for applying...",
  "emailLink": "https://mail.google.com/...",
  "notes": "Great opportunity!",
  "manuallyEdited": false,
  "needsReview": false,
  "gmailAccount": {
    "email": "user@gmail.com"
  },
  "timeline": [...],
  "resumes": [...],
  "reminders": [...]
}
```

---

### Create Application (Manual)

**POST** `/api/applications`

Manually create a job application.

**Authentication**: Required

**Request Body**:
```json
{
  "companyName": "Microsoft",
  "jobRole": "Senior Developer",
  "applicationDate": "2026-01-15T00:00:00.000Z",
  "status": "APPLIED",
  "applicationSource": "Company Website",
  "hasReferral": false,
  "notes": "Direct application through careers page"
}
```

**Response**:
```json
{
  "id": "app_456",
  "companyName": "Microsoft",
  "jobRole": "Senior Developer",
  ...
}
```

---

### Update Application

**PATCH** `/api/applications/{applicationId}`

Update job application details.

**Authentication**: Required

**Path Parameters**:
- `applicationId`: Job application ID

**Request Body** (all fields optional):
```json
{
  "companyName": "Microsoft Corporation",
  "jobRole": "Senior Software Engineer",
  "status": "INTERVIEW",
  "notes": "Had great conversation with hiring manager",
  "hasReferral": true,
  "referralName": "Jane Smith"
}
```

**Response**: Updated application object

**Notes**:
- Sets `manuallyEdited` to `true`
- Creates timeline event for status changes
- Can override AI-extracted data

---

### Delete Application

**DELETE** `/api/applications/{applicationId}`

Delete a job application.

**Authentication**: Required

**Path Parameters**:
- `applicationId`: Job application ID

**Response**:
```json
{
  "success": true
}
```

---

## Analytics

### Get Dashboard Stats

**GET** `/api/analytics/stats`

Get overview statistics.

**Authentication**: Required

**Response**:
```json
{
  "total": 150,
  "applied": 50,
  "phoneScreen": 20,
  "interview": 30,
  "offer": 5,
  "rejected": 40,
  "referrals": 15
}
```

---

### Get Application Trends

**GET** `/api/analytics/trends`

Get application trends over time.

**Authentication**: Required

**Query Parameters**:
- `period`: `week`, `month`, `quarter`, `year` (default: `month`)

**Response**:
```json
{
  "period": "month",
  "data": [
    {
      "date": "2026-01-01",
      "applied": 10,
      "interviews": 3,
      "offers": 1,
      "rejected": 5
    },
    ...
  ]
}
```

---

### Get Response Rates

**GET** `/api/analytics/response-rates`

Get response rates by platform and company.

**Authentication**: Required

**Response**:
```json
{
  "byPlatform": {
    "LinkedIn": {
      "applications": 50,
      "responses": 20,
      "rate": 0.40
    },
    "Indeed": {
      "applications": 30,
      "responses": 8,
      "rate": 0.27
    }
  },
  "byCompany": [...],
  "referralComparison": {
    "withReferral": {
      "applications": 20,
      "responses": 15,
      "rate": 0.75
    },
    "withoutReferral": {
      "applications": 100,
      "responses": 25,
      "rate": 0.25
    }
  }
}
```

---

## Error Handling

All endpoints return errors in the following format:

```json
{
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Error Codes

- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User lacks permission
- `NOT_FOUND`: Resource doesn't exist
- `VALIDATION_ERROR`: Invalid input data
- `DUPLICATE`: Resource already exists
- `GMAIL_API_ERROR`: Gmail API call failed
- `DATABASE_ERROR`: Database operation failed
- `RATE_LIMIT`: Too many requests

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication**: 10 requests per minute
- **Gmail Sync**: 1 request per minute per account
- **General APIs**: 100 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642521600
```

---

## Webhooks (Future)

Webhooks will be added to notify external systems of events:

- New application detected
- Status change
- Interview scheduled
- Offer received

Configuration will be available in settings.

---

## SDKs and Client Libraries

Currently, the API is accessible via standard HTTP requests. Official SDKs for Python, JavaScript, and other languages are planned for future releases.

---

## Support

For API questions or issues:
- GitHub Issues: https://github.com/DINESH2841/Job_Tracker/issues
- Documentation: See README.md and SETUP.md

---

## Changelog

### v1.0.0 (Current)
- Initial API release
- Authentication endpoints
- Gmail account management
- Job application CRUD
- Basic analytics

---

**Last Updated**: January 2026
