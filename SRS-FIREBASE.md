# Software Requirements Specification (SRS)

## Job Tracker Web Application (Updated for Firebase & Google Auth)

### 1. Introduction

#### 1.1 Purpose
This document specifies the requirements for a Job Tracker Web Application that helps users automatically track job applications by fetching and analyzing emails from one or more linked Gmail accounts. The system provides intelligent insights, reminders, analytics, and manual control through a modern, secure web interface implemented using Firebase and Google Authentication.

#### 1.2 Scope
The system enables users to:
- Create a single Job Tracker account using Google Authentication
- Link multiple Gmail accounts to one tracker account
- Automatically extract job application data from emails
- Track application status, referrals, resume versions, and follow-ups
- View insights and analytics dashboards
- Manually edit and correct extracted data
- Access the application online via HTTPS

The system is intended for personal job tracking only and does not perform automated job applications or unauthorized scraping.

#### 1.3 Definitions
- **Tracker Account**: The main user account identified by a Firebase UID
- **Linked Gmail Account**: A Gmail account connected via OAuth for email access
- **Application Intelligence**: Automated extraction, inference, and confidence scoring of job-related data

### 2. Overall Description

#### 2.1 Product Perspective
The application is a cloud-hosted, serverless-first web platform consisting of:
- Frontend web application
- Backend services implemented using Firebase Cloud Functions
- Gmail API integration
- Firebase Firestore database and analytics layer

#### 2.2 User Classes
| User Type | Description |
| --- | --- |
| End User | Job seeker using the tracker |
| Admin | System administrator (monitoring and maintenance only) |

#### 2.3 Operating Environment
- Web browsers (Chrome, Firefox, Edge)
- Desktop and mobile devices
- Internet connection required

### 3. System Architecture (High Level)
- **Frontend**: React / Next.js
- **Backend**: Firebase Cloud Functions (Node.js)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication (Google OAuth 2.0)
- **Hosting**: Firebase Hosting / Vercel
- **External APIs**: Gmail API, Google Calendar API

### 4. User Authentication & Account Management

#### 4.1 Tracker Account Login
- **AUTH-1**: Users shall authenticate using Google Sign-In via Firebase Authentication
- **AUTH-2**: Each authenticated user shall be uniquely identified by a Firebase UID
- **AUTH-3**: Backend services shall verify Firebase ID tokens for every protected request
- **AUTH-4**: Users shall be able to securely log out
- **AUTH-5**: Each tracker account shall have isolated private data

> Note: Frontend-only authentication shall not be trusted.

### 5. Multiple Gmail Account Association

#### 5.1 Gmail Account Linking
- **GMAIL-1**: A single tracker account shall support linking multiple Gmail accounts
- **GMAIL-2**: Gmail access shall be granted using Google OAuth 2.0 with read-only scopes
- **GMAIL-3**: Users shall be able to:
  - Add new Gmail accounts
  - Remove linked Gmail accounts
  - Re-authenticate expired Gmail access

#### 5.2 Gmail Account Management
- **GMAIL-4**: All linked Gmail accounts shall be stored in Firestore
- **GMAIL-5**: Users shall enable or disable email syncing per Gmail account
- **GMAIL-6**: Duplicate Gmail accounts shall be prevented per tracker account

#### 5.3 Email Fetching Rules
- **GMAIL-7**: Emails shall be fetched independently for each linked Gmail account
- **GMAIL-8**: Emails from all Gmail accounts shall be merged into a single dashboard
- **GMAIL-9**: Each job entry shall store its source Gmail account

### 6. Email Fetching & Job Data Extraction

#### 6.1 Email Fetching
- **MAIL-1**: Email fetching shall be performed by backend Cloud Functions
- **MAIL-2**: Only job-related emails shall be processed
- **MAIL-3**: Filtering shall use:
  - Keywords
  - Known job platforms
  - Sender domains
- **MAIL-4**: The system shall fetch:
  - Subject
  - Sender
  - Timestamp
  - Message ID
  - Email body

#### 6.2 Job Data Extraction
- **EXT-1**: The system shall extract:
  - Company name
  - Job role
  - Application date and time
  - Application source
  - Referral indicators
- **EXT-2**: Low-confidence fields shall be marked as “Needs Review”

### 7. Application Intelligence

#### 7.1 Status Detection
- **AI-1**: Application status shall be auto-detected as:
  - Applied
  - Interview
  - Rejected
  - Offer
- **AI-2**: Status changes shall be inferred from new emails
- **AI-3**: Users shall be able to manually override detected status

#### 7.2 Application Timeline
- **AI-4**: Each application shall maintain a timeline showing:
  - Application submission
  - Status updates
  - Follow-ups
  - Interview events

#### 7.3 Confidence Scoring
- **AI-5**: Each extracted field shall have a confidence score:
  - High
  - Medium
  - Low
- **AI-6**: Low-confidence fields shall be visually highlighted

### 8. Dashboard & UI Requirements

#### 8.1 Dashboard
- **UI-1**: Dashboard shall be the default landing page
- **UI-2**: Dashboard shall display:
  - Job role
  - Company name
  - Application date/time
  - Status
  - Referral status
  - Source Gmail account
  - Direct Gmail link
- **UI-3**: Dashboard shall support search, filter, and sort

#### 8.2 Manual Editing
- **UI-4**: Users shall be able to edit all extracted fields
- **UI-5**: Manual edits shall override automated data
- **UI-6**: User edits shall improve future extraction accuracy

### 9. Follow-Up & Reminder Engine

#### 9.1 Reminders
- **REM-1**: Users shall set follow-up reminders after X days
- **REM-2**: The system shall suggest follow-up timing

#### 9.2 Calendar Integration
- **REM-3**: Google Calendar integration shall be supported
- **REM-4**: Follow-ups and interviews may be added as calendar events

#### 9.3 Email Templates
- **REM-5**: Follow-up email templates shall be provided
- **REM-6**: One-click Gmail compose with pre-filled content

### 10. Resume Version Tracking
- **RES-1**: Resume files (PDF) shall be uploaded to Firebase Storage
- **RES-2**: Resume versions shall be linked to applications
- **RES-3**: Resume performance analytics shall be generated

### 11. Referral Management System
- **REF-1**: Referral details tracked:
  - Contact name
  - Platform
  - Status
  - Notes
- **REF-2**: Referral timelines shall be linked to applications

### 12. Analytics & Insights
- **AN-1**: Analytics shall include:
  - Applications per week
  - Response rate by platform
  - Referral vs non-referral success
  - Time to response per company
- **AN-2**: Analytics shall be precomputed where required for performance

### 13. AI Learning & Smart Suggestions
- **ML-1**: User corrections shall improve parsing accuracy
- **ML-2**: Company-specific email templates shall be supported
- **ML-3**: Suggestions shall be explainable and actionable

### 14. Collaboration & Sharing
- **COL-1**: Users shall share read-only dashboards
- **COL-2**: Data export to PDF and CSV shall be supported

### 15. Non-Functional Requirements

#### 15.1 Performance
- Dashboard load ≤ 2 seconds
- Email sync ≤ 30 seconds (5,000 emails)

#### 15.2 Security
- Firebase ID token verification on backend
- Encrypted Gmail OAuth tokens
- Firestore security rules enforced
- HTTPS only

#### 15.3 Scalability
- Support thousands of users
- Cloud Function–based background processing

### 16. Assumptions & Constraints
- Gmail API rate limits apply
- Email formats vary
- Manual correction may be required
- Firebase service limits apply

### 17. Future Enhancements
- Chrome extension
- Resume optimization insights
- Placement cell dashboards
- Advanced ML-based predictions

### Final Straight Talk
This updated SRS preserves the original intent while making the system:
- Technically correct
- Firebase-aligned
- Secure
- Implementable
- Interview-defensible

This is no longer a “concept SRS”.
This is an execution-ready system specification.

---

## Job Tracker Web Application – Phase 1 (Firebase + Google Auth)

### 1. Introduction

#### 1.1 Purpose
This document defines the Phase 1 requirements for a Job Tracker Web Application that helps users track job applications by securely fetching and analyzing job-related emails from linked Gmail accounts. Phase 1 focuses on core functionality, reliability, and visibility, implemented using Firebase and Google Authentication.

#### 1.2 Scope (Phase 1 Only)
Phase 1 enables users to:
- Log in using Google Authentication (Firebase)
- Link multiple Gmail accounts to one tracker account
- Fetch and store job-related emails
- Extract basic job application details
- View applications in a dashboard
- Manually edit and correct extracted data
- Track application status and timeline
- Monitor Gmail sync health
- Access the application securely online via HTTPS

Out of scope (Phase 1):
- Advanced ML models
- Chrome extension
- Resume optimization
- Placement dashboards

#### 1.3 Definitions
- **Tracker Account**: A user account identified by Firebase UID
- **Linked Gmail Account**: A Gmail account connected via Gmail OAuth
- **Fetcher / Worker**: Background process that syncs or processes emails
- **Needs Review**: Data requiring user confirmation due to low confidence

### 2. Overall Description

#### 2.1 Product Perspective
The application is a serverless-first web platform built on Firebase, consisting of:
- Web frontend
- Firebase Cloud Functions (backend)
- Gmail API integration
- Firestore database
- Firebase Authentication

#### 2.2 User Classes
| User Type | Description |
| --- | --- |
| End User | Job seeker using the tracker |
| System Admin | Operational monitoring only (no user data access) |

#### 2.3 Operating Environment
- Desktop and mobile web browsers
- Internet connection required
- Google account required for login

### 3. System Architecture (Phase 1)
- **Frontend**: React / Next.js
- **Backend**: Firebase Cloud Functions (Node.js)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication (Google OAuth)
- **Hosting**: Firebase Hosting / Vercel
- **External APIs**: Gmail API

### 4. User Authentication & Account Management

#### 4.1 Authentication
- **AUTH-1**: Users shall authenticate using Google Sign-In via Firebase.
- **AUTH-2**: Each user shall be uniquely identified by a Firebase UID.
- **AUTH-3**: All backend requests shall verify Firebase ID tokens.
- **AUTH-4**: Users shall be able to securely log out.
- **AUTH-5**: Each tracker account shall have isolated private data.

### 5. Multiple Gmail Account Association

#### 5.1 Gmail Account Linking
- **GMAIL-1**: A tracker account shall support linking multiple Gmail accounts.
- **GMAIL-2**: Gmail access shall use Google OAuth 2.0 with read-only scope.
- **GMAIL-3**: Users shall be able to:
  - Add Gmail accounts
  - Remove Gmail accounts
  - Re-authenticate expired access

#### 5.2 Gmail Account Management
- **GMAIL-4**: Linked Gmail accounts shall be stored in Firestore.
- **GMAIL-5**: Users shall enable or disable sync per Gmail account.
- **GMAIL-6**: Duplicate Gmail accounts shall not be linked to the same tracker account.

### 6. Email Fetching & Background Workers

#### 6.1 Email Fetching
- **MAIL-1**: Email fetching shall be executed via Cloud Functions.
- **MAIL-2**: Only job-related emails shall be processed.
- **MAIL-3**: Filtering shall use keywords, known platforms, and sender domains.
- **MAIL-4**: The system shall fetch:
  - Subject
  - Sender
  - Timestamp
  - Gmail message ID
  - Email body

#### 6.2 Idempotency & Safety
- **MAIL-5**: Gmail message IDs shall be used to prevent duplicate processing.
- **MAIL-6**: Re-syncing shall not create duplicate applications.

#### 6.3 Background Workers & Fetchers
- **WK-1**: Background workers shall handle:
  - Gmail ingestion
  - Email parsing
  - Status inference
- **WK-2**: Each worker shall register its state in Firestore, including:
  - Worker type
  - Firebase UID
  - Gmail account ID (if applicable)
  - Status (idle, running, failed)
  - Last heartbeat
  - Last error
- **WK-3**: Workers shall periodically update heartbeat timestamps.
- **WK-4**: Stale or failed workers shall be detectable.
- **WK-5**: Users shall be able to manually trigger Gmail re-sync.

### 7. Job Data Extraction (Phase 1)
- **EXT-1**: The system shall extract:
  - Company name
  - Job role
  - Application date/time
  - Source Gmail account
- **EXT-2**: Low-confidence fields shall be marked as Needs Review.

### 8. Application Intelligence (Phase 1)

#### 8.1 Status Detection
- **AI-1**: Application status shall be inferred as:
  - Applied
  - Interview
  - Rejected
  - Offer
- **AI-2**: Users shall be able to override inferred status.

#### 8.2 Application Timeline
- **AI-3**: Each application shall maintain a timeline containing:
  - Application creation
  - Status changes
  - Manual edits

### 9. Dashboard & UI Requirements

#### 9.1 Dashboard
- **UI-1**: Dashboard shall be the default landing page.
- **UI-2**: Dashboard shall display:
  - Job role
  - Company name
  - Application date
  - Status
  - Gmail source
  - Direct Gmail link
- **UI-3**: Dashboard shall support search, filter, and sort.

#### 9.2 Manual Editing
- **UI-4**: Users shall be able to edit all extracted fields.
- **UI-5**: Manual edits shall override system-generated values.
- **UI-6**: Edited fields shall be visually distinguished.

### 10. Security (Phase 1)
- **SEC-1**: Firebase ID tokens shall be verified on every backend request.
- **SEC-2**: Gmail OAuth tokens shall be stored only in backend services.
- **SEC-3**: Firestore security rules shall enforce per-UID access.
- **SEC-4**: All access shall occur over HTTPS.

### 11. Monitoring & Observability
- **OBS-1**: Background workers shall log start, success, and failure events.
- **OBS-2**: Errors shall be associated with Gmail account and worker ID.
- **OBS-3**: Sync status and last sync time shall be visible to users.

### 12. Performance Requirements
- Dashboard load time ≤ 2 seconds
- Gmail sync for up to 5,000 emails ≤ 30 seconds
- UI actions shall not block background processing

### 13. Assumptions & Constraints
- Gmail API rate limits apply
- Email formats vary significantly
- Manual review may be required
- Firebase execution limits apply

### 14. Phase 1 Deliverables
- Firebase Authentication with Google login
- Multi-Gmail linking
- Gmail email ingestion
- Application extraction and dashboard
- Manual editing
- Worker health visibility
- Secure deployment

### Final Reality Check
This Phase 1 SRS is:
- Technically correct
- Firebase-aligned
- Buildable without guessing
- Easy to defend in reviews
- A strong foundation for Phase 2

You are no longer “planning”.
You are ready to execute.
