# Job Tracker Monorepo

Production-grade job application tracker with multi-Gmail support, AI-powered email extraction, analytics, and intelligent insights.

## Project Structure

```
job-tracker/
├── frontend/          # Next.js frontend application
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── types/
│   ├── prisma/
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── .env (create from .env.example)
│
├── backend/           # Node.js / Express backend API
│   ├── src/
│   │   ├── config.ts
│   │   ├── server.ts
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── services/
│   │   └── utils/
│   ├── dist/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env (create from .env.example)
│
├── docs/              # Documentation
├── README.md
└── package.json       # Monorepo root
```

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn
- PostgreSQL (for database)

### Installation

1. Clone the repository:
   ```bash
   git clone <repo>
   cd job-tracker
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   npm install
   ```

### Setup Environment Files

**Frontend** (`frontend/.env`):
```bash
cd frontend
Copy-Item .env.example .env
# Edit .env with your Firebase and backend API URL
```

**Backend** (`backend/.env`):
```bash
cd backend
Copy-Item .env.example .env
# Edit .env with your JWT_SECRET and Google OAuth credentials
```

### Running Development Servers

Run both frontend and backend concurrently:
```bash
npm run dev
```

Or run separately:

**Frontend** (port 3000):
```bash
cd frontend
npm run dev
```

**Backend** (port 4000):
```bash
cd backend
npm run dev
```

### Building for Production

```bash
npm run build
```

This builds both frontend and backend.

## Phase 1: Foundations (Backend)

✅ User + Gmail account schema  
✅ OAuth 2.0 flow  
✅ JWT session/token issuance  
✅ Auth middleware & account isolation  
✅ Logging & audit trails  
✅ Configuration validation  

See [docs/task.md](docs/task.md) for complete execution plan.

## Architecture

- **Frontend**: Next.js with React, Tailwind CSS, Prisma ORM, NextAuth
- **Backend**: Node.js/Express with TypeScript, JWT authentication, Gmail API integration
- **Database**: PostgreSQL with Prisma schema
- **Auth**: Google OAuth 2.0 + JWT tokens

## Documentation

- [Setup Guide](SETUP.md)
- [Deployment Guide](DEPLOYMENT.md)
- [API Reference](API.md)
- [Requirements](REQUIREMENTS.md)
- [Task List](docs/task.md)

## License

ISC
