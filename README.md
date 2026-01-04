# refto-one

A modern full-stack TypeScript application for discovering and curating website design inspiration. Built with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack).

## Features

- **Design Discovery** - Browse curated website designs with multiple feed options (Latest, Trending, Popular)
- **Version History** - Track how website designs evolve over time with dated snapshots
- **Dual View Mode** - Preview designs in both web and mobile layouts
- **Weekly Leaderboard** - Discover top-rated designs each week
- **Social Engagement** - Like and save your favorite designs
- **Site Submissions** - Submit new websites for community review
- **Admin Dashboard** - Analytics, user management, and content moderation

## Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 19, TanStack Start (SSR), TanStack Router |
| **Styling** | Tailwind CSS v4, shadcn/ui (base-nova) |
| **API Layer** | oRPC (end-to-end type-safe RPC) |
| **Database** | PostgreSQL + Drizzle ORM |
| **Authentication** | Better Auth (Email/Password, GitHub, Google OAuth) |
| **File Storage** | Cloudflare R2 |
| **Email** | React Email + Resend |
| **Deployment** | Cloudflare Workers + Wrangler |
| **Code Quality** | Biome + Ultracite |
| **Package Manager** | pnpm (monorepo workspaces) |

## Project Structure

```
refto-one/
├── apps/
│   └── web/                      # Full-stack application (port 3001)
│       └── src/
│           ├── routes/           # File-based routing
│           │   ├── (auth)/       # Auth pages (login/signup/reset)
│           │   ├── (app)/        # Protected app routes
│           │   ├── (admin)/      # Admin dashboard routes
│           │   └── api/          # API route handlers
│           ├── components/
│           │   ├── ui/           # shadcn/ui components
│           │   ├── shared/       # Shared components
│           │   └── features/     # Feature-specific components
│           ├── lib/              # Utilities (auth-client, utils)
│           ├── hooks/            # Custom React hooks
│           └── utils/            # Utilities (oRPC client)
│
├── packages/
│   ├── api/                      # oRPC routers and procedures
│   ├── auth/                     # Better Auth configuration
│   ├── db/                       # Drizzle database schema
│   ├── email/                    # React Email templates
│   └── common/                   # Shared types and validations
```

## Installation

### Prerequisites

- Node.js 24+
- pnpm 10+
- PostgreSQL database

### Setup

1. Clone the repository and install dependencies:

```bash
git clone <repo-url>
cd refto-one
pnpm install
```

2. Configure environment variables:

```bash
cp apps/web/.env.example apps/web/.env
```

Edit `apps/web/.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/refto_one"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3001"
CORS_ORIGIN="http://localhost:3001"

# OAuth (optional)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Email (optional)
EMAIL_USER="noreply@your-domain.com"
RESEND_API_KEY=""

# Cloudflare R2 Storage (optional)
CLOUD_FLARE_R2_ACCOUNT_ID=""
CLOUD_FLARE_S3_UPLOAD_KEY=""
CLOUD_FLARE_S3_UPLOAD_SECRET=""
CLOUD_FLARE_S3_UPLOAD_BUCKET=""
VITE_CLOUD_FLARE_R2_URL=""
```

3. Initialize the database:

```bash
pnpm run db:push
```

## Development

Start the development server:

```bash
pnpm run dev
```

Visit [http://localhost:3001](http://localhost:3001)

### Commands

```bash
# Development
pnpm run dev          # Start all apps
pnpm run dev:web      # Start web app only

# Type Checking
pnpm run check-types  # Check TypeScript types across all packages

# Code Quality
pnpm run check        # Biome formatting and linting
npx ultracite fix     # Auto-fix code issues

# Database
pnpm run db:push      # Push schema changes to database
pnpm run db:generate  # Generate migration files
pnpm run db:migrate   # Run migrations
pnpm run db:studio    # Open Drizzle Studio
```

## Build

```bash
pnpm run build
```

Build output is located at `apps/web/dist/`

## Deployment

### Cloudflare Workers

This project uses Wrangler and the Cloudflare Vite plugin for deploying to Cloudflare Workers.

#### Configuration Files

| File | Purpose |
|------|---------|
| `apps/web/wrangler.toml` | Wrangler configuration with non-sensitive vars |
| `apps/web/.dev.vars` | Local development secrets (not committed) |

#### Environment Variables

**Non-sensitive variables** are stored in `wrangler.toml`:

```toml
[vars]
CORS_ORIGIN = "https://your-domain.com"
BETTER_AUTH_URL = "https://your-domain.com"
EMAIL_USER = "hi@your-domain.com"
GITHUB_CLIENT_ID = "..."
GOOGLE_CLIENT_ID = "..."
CLOUD_FLARE_R2_ACCOUNT_ID = "..."
CLOUD_FLARE_S3_UPLOAD_BUCKET = "..."
VITE_CLOUD_FLARE_R2_URL = "https://storage.your-domain.com"
```

**Sensitive secrets** are set via Wrangler CLI (one-time setup):

```bash
cd apps/web

# Database
pnpm exec wrangler secret put DATABASE_URL

# Auth
pnpm exec wrangler secret put BETTER_AUTH_SECRET

# Email
pnpm exec wrangler secret put RESEND_API_KEY

# OAuth secrets
pnpm exec wrangler secret put GITHUB_CLIENT_SECRET
pnpm exec wrangler secret put GOOGLE_CLIENT_SECRET

# R2 storage
pnpm exec wrangler secret put CLOUD_FLARE_S3_UPLOAD_KEY
pnpm exec wrangler secret put CLOUD_FLARE_S3_UPLOAD_SECRET
```

#### Deploy Commands

```bash
# Build and deploy to Cloudflare Workers
pnpm run deploy

# Delete deployment
pnpm run deploy:destroy
```

### Alternative Platforms

Built with TanStack Start, also deployable to:

- **Node.js Server** - Run build output directly
- **Docker** - Containerized deployment
- **Vercel / Netlify** - Requires adapter configuration

## License

MIT
