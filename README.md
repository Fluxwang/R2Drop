# R2Drop

A private file management app built with Next.js App Router + NextAuth + Prisma + Cloudflare R2.

It supports email-based registration/login, drag-and-drop and batch upload, file list management, single/batch download, and single/batch deletion, with server-side authorization checks to ensure each user can only access their own files.

## Project Origin

This project is based on [LearningR2Drop](https://github.com/Fluxwang/LearningR2Drop) and includes AI-driven UI optimization improvements.

Chinese version: [zhREADME.md](./zhREADME.md)

## Features

- Authentication
  - `next-auth` Credentials Provider (email + password)
  - Register, login, logout
  - Protected pages (`/dashboard`, `/files`) with redirect for unauthenticated users
- Upload
  - Server generates pre-signed URLs, client uploads directly to Cloudflare R2
  - Multi-file queue, drag-and-drop, upload progress display
- File management
  - List current user's files (sorted by last modified desc)
  - Single file download/delete
  - Batch download/delete
- Security
  - All file APIs require authenticated session
  - Server validates object key prefix to block cross-user access
- Engineering
  - Prisma for user model and migrations
  - Supports `HTTPS_PROXY`/`HTTP_PROXY`

## Tech Stack

- Frontend: Next.js 15 (App Router), React 19, Tailwind CSS 4, DaisyUI
- Auth: NextAuth v4 (Credentials)
- Storage: Cloudflare R2 (S3-compatible) + AWS SDK v3
- Database: PostgreSQL + Prisma
- Other: Axios (upload progress)

## Quick Start

### 1. Requirements

- Node.js 20+
- npm 10+
- PostgreSQL (local or cloud)
- Cloudflare R2 bucket

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create `.env` in the project root:

```bash
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/DB?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DB"

# NextAuth
NEXTAUTH_SECRET="replace-with-a-long-random-string"
NEXTAUTH_URL="http://localhost:3000"

# Cloudflare R2
R2_ENDPOINT="https://<accountid>.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="<your-r2-access-key-id>"
R2_SECRET_ACCESS_KEY="<your-r2-secret-access-key>"
R2_BUCKET_NAME="<your-bucket-name>"

# Optional proxy
HTTPS_PROXY="http://127.0.0.1:7890"
# or HTTP_PROXY="http://127.0.0.1:7890"
```

### 4. Initialize database and Prisma Client

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Start development server

```bash
npm run dev
```

Open `http://localhost:3000` (the app redirects to `/login`).

## Scripts

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```text
.
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── register/route.ts
│   │   ├── upload/route.ts
│   │   ├── files/route.ts
│   │   ├── download/route.ts
│   │   ├── delete/route.ts
│   │   ├── bulkdownload/route.ts
│   │   └── bulkdelete/route.ts
│   ├── dashboard/page.tsx
│   ├── files/
│   ├── login/page.tsx
│   └── register/page.tsx
├── lib/
│   ├── auth.ts
│   ├── r2.ts
│   └── formatBytes.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── README.md
└── zhREADME.md
```

## API Overview

All endpoints are implemented under App Router API routes.

### Auth

- `POST /api/register`
  - Description: Register new user (unique email, hashed password)
  - Body: `{ email, password, confirmPassword }`
- `GET|POST /api/auth/[...nextauth]`
  - Description: Default NextAuth route (signin/session/callback flow)

### Files

- `POST /api/upload` (auth required)
  - Description: Generate pre-signed upload URL
  - Body: `{ filename, contentType }`
  - Response: `{ url, key }`

- `GET /api/files` (auth required)
  - Description: Get current user's files
  - Response: `{ files, count, userEmail }`

- `POST /api/download` (auth required)
  - Description: Generate pre-signed download URL for one file
  - Body: `{ key }`
  - Response: `{ url }`

- `DELETE /api/delete` (auth required)
  - Description: Delete one file
  - Body: `{ key }`

- `POST /api/bulkdownload` (auth required)
  - Description: Generate pre-signed URLs for multiple files
  - Body: `{ keys: string[] }`
  - Response: `{ downloads: [{ key, filename, url }] }`

- `DELETE /api/bulkdelete` (auth required)
  - Description: Delete multiple files
  - Body: `{ key: string[] }`

## Object Key Pattern

Uploaded objects are stored as:

```text
uploads/{userEmail}/{uuid}/{filename}
```

This path pattern is also used by server-side authorization checks.

## Manual Verification Checklist

1. Register a new user and verify redirect to login.
2. Login and verify access to `/dashboard`.
3. Upload single and multiple files; verify progress UI.
4. Open `/files` and verify uploaded files are listed.
5. Verify single-file download and delete.
6. Verify batch download and batch delete.
7. Verify unauthenticated access to `/dashboard` or `/files` redirects to `/login`.

## Deployment

1. Prepare PostgreSQL and Cloudflare R2 credentials.
2. Set all required env vars in your deployment platform.
3. Run migrations:

```bash
npx prisma migrate deploy
```

4. Build and run:

```bash
npm run build
npm run start
```

## Troubleshooting

- `R2 环境变量配置不当` on startup
  - Check `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`.
- Upload/download timeout
  - Configure `HTTPS_PROXY` or check network connectivity.
- Session/login issues
  - Verify `NEXTAUTH_SECRET` and `NEXTAUTH_URL`.
- Prisma migration failure
  - Verify `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) are correct.

## License

Currently for learning/internal use. Add an explicit OSS license before public open-source release.
