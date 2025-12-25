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

- Node.js 20+
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

# OAuth (optional)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Email (optional)
RESEND_API_KEY=""

# File Storage (optional)
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME=""
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

Build output is located at `apps/web/.output/`

## Deployment

### Cloudflare Workers (Recommended)

This project uses [Alchemy](https://alchemy.run) for deploying to Cloudflare Workers.

#### Prerequisites

1. A Cloudflare account with Workers enabled
2. Cloudflare API token with appropriate permissions
3. Configure environment variables in `apps/web/.env`

#### Environment Variables

```env
# Required
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="your-secret-key-32-chars-min"
BETTER_AUTH_URL="https://your-domain.com"
CORS_ORIGIN="https://your-domain.com"
EMAIL_USER="noreply@your-domain.com"

# OAuth
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Email
RESEND_API_KEY=""

# Cloudflare R2 Storage
CLOUD_FLARE_R2_ACCOUNT_ID=""
CLOUD_FLARE_S3_UPLOAD_KEY=""
CLOUD_FLARE_S3_UPLOAD_SECRET=""
CLOUD_FLARE_S3_UPLOAD_BUCKET=""
VITE_CLOUD_FLARE_R2_URL=""
```

#### Deploy Commands

```bash
# Deploy to Cloudflare Workers
pnpm run deploy

# Destroy deployment
pnpm run deploy:destroy
```

The deployment configuration is defined in `apps/web/alchemy.run.ts`. Custom domains can be configured in the `domains` option.

### Alternative Platforms

Built with TanStack Start, also deployable to:

- **Node.js Server** - Run build output directly
- **Docker** - Containerized deployment
- **Vercel / Netlify** - Requires adapter configuration

## License

MIT
