# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Refto is a curated design reference website built with Next.js App Router, featuring email subscriptions and an admin panel for content management.

## Development Commands

```bash
pnpm dev              # Start development server
pnpm build            # Production build
pnpm check            # Biome lint and format (auto-fix)
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Run Drizzle migrations
pnpm db:push          # Push Drizzle schema to database
pnpm db:studio        # Open Drizzle Studio
pnpm email:dev        # Preview email templates (port 3527)
```

## Architecture

### Directory Structure

```
src/
├── app/
│   ├── (auth)/             # Login/register pages
│   ├── (account)/          # User account pages (profile, favorites, submissions)
│   ├── (admin)/            # Admin dashboard with sidebar
│   ├── (home)/             # Home page
│   ├── (root)/             # Public pages
│   └── api/
│       ├── auth/           # Better Auth endpoint
│       └── rpc/            # oRPC API handler
├── components/
│   ├── features/           # Feature-specific components
│   │   ├── account/        # Account management (ProfileCard, PasswordCard, etc.)
│   │   ├── admin/          # Admin components (sidebars, dialogs)
│   │   ├── auth/           # Auth components (UserAuthNav)
│   │   ├── home/           # Home page components (masonry)
│   │   └── site/           # Site components (showcase, filters, subscription)
│   ├── shared/             # Reusable components (icons, uploaders)
│   └── ui/                 # shadcn/ui primitives
├── db/
│   ├── schema.ts           # Drizzle schema definitions
│   └── index.ts            # Drizzle client singleton
├── hooks/                  # Custom React hooks
│   ├── use-file-upload.ts  # R2 file upload hook
│   └── use-url-meta-fetch.ts # URL metadata fetching hook
├── lib/
│   ├── auth.ts             # Better Auth configuration
│   ├── auth-client.ts      # Better Auth client
│   ├── orpc/               # oRPC client setup (client.ts, react.tsx, server.ts)
│   ├── error-handler.ts    # Unified error handling utilities
│   └── validations/        # Zod schemas (common.ts for shared validators)
├── server/
│   ├── api/
│   │   ├── root.ts         # oRPC app router
│   │   ├── orpc.ts         # Context and procedures
│   │   └── routers/        # Individual routers
│   └── functions/          # Reusable server functions
└── env.js                  # t3-env validation
```

### oRPC Setup

- **Routers**: `refSites`, `weekly`, `subscriber`, `upload`, `siteMeta`, `submitSite`, `user`
- **Procedures**: `publicProcedure` (no auth), `protectedProcedure` (auth required), `adminProcedure` (admin only)
- **Server calls**: Use `@/lib/orpc/server` for RSC, `@/lib/orpc/react` for client with TanStack Query

### Key Patterns

- **Path alias**: Use `@/` for imports (e.g., `@/lib/utils`)
- **Route groups**: `(auth)`, `(account)`, `(admin)`, `(home)`, `(root)` for layout separation
- **State**: Jotai for local state (`_store/`), TanStack Query via oRPC for server state
- **Validation**: Zod schemas in `lib/validations/` shared between forms and oRPC
- **Server functions**: Extract business logic to `server/functions/` for reuse
- **Hooks**: Reusable hooks in `src/hooks/` (useFileUpload, useUrlMetaFetch, etc.)
- **Error handling**: Use `@/lib/error-handler` for consistent error messages

### Database (Drizzle ORM + PostgreSQL)

Key models: `user`, `account`, `refSite`, `weekly`, `subscriber`, `submitSite`

Schema and types are exported from `@/db/schema`.

### Authentication

Better Auth with multiple providers:
- Email OTP (6-digit verification codes)
- GitHub OAuth
- Google OAuth

Roles: `USER`, `ADMIN`. Use `authClient` from `@/lib/auth-client` for client-side auth operations.

### File Upload

Files are uploaded to Cloudflare R2. Use `useFileUpload` hook or `client.upload.getUploadUrl` to get signed URLs.

## Code Standards

This project uses **Ultracite** (Biome preset) for linting and formatting. Run `pnpm check` before committing.
