# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Refto is a curated design reference website built with Next.js App Router, featuring internationalization, email subscriptions, and an admin panel for content management.

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
│   ├── [locale]/           # i18n routing (en, zh-CN)
│   │   ├── (auth)/         # Login/register pages
│   │   ├── (home)/         # Home page
│   │   ├── (panel)/panel/  # Admin dashboard
│   │   └── (root)/         # Public pages
│   └── api/
│       ├── auth/           # Better Auth endpoint
│       └── trpc/           # tRPC API handler
├── db/
│   ├── schema.ts           # Drizzle schema definitions
│   └── index.ts            # Drizzle client singleton
├── server/
│   ├── api/
│   │   ├── root.ts         # tRPC app router
│   │   ├── trpc.ts         # Context and procedures
│   │   └── routers/        # Individual routers
│   └── functions/          # Reusable server functions
├── lib/
│   ├── auth.ts             # Better Auth configuration
│   ├── db.ts               # Re-exports from @/db
│   ├── trpc/               # tRPC client setup
│   └── validations/        # Zod schemas
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   └── shared/             # Reusable components
├── messages/               # i18n translations (en.json, zh-CN.json)
└── env.js                  # t3-env validation
```

### tRPC Setup

- **Routers**: `refSites`, `weekly`, `subscriber`, `upload`, `siteMeta`, `submitSite`
- **Procedures**: `publicProcedure` (no auth), `protectedProcedure` (auth required)
- **Role-based access**: Use `meta.requiredRoles` for admin-only endpoints
- **Server calls**: Use `src/lib/trpc/server.ts` for RSC, `src/lib/trpc/react.tsx` for client

### Key Patterns

- **Path alias**: Use `@/` for imports (e.g., `@/lib/utils`)
- **Route groups**: `(auth)`, `(home)`, `(panel)`, `(root)` for layout separation
- **State**: Jotai for local state (`_store/`), React Query via tRPC for server state
- **Validation**: Zod schemas in `lib/validations/` shared between forms and tRPC
- **Server functions**: Extract business logic to `server/functions/` for reuse

### Database (Drizzle ORM + PostgreSQL)

Key models: `user`, `refSite`, `weekly`, `subscriber`, `submitSite`

Schema and types are exported from `@/db/schema`.

### Authentication

Email/OTP via Better Auth with 6-digit verification codes. Roles: `USER`, `ADMIN`.

### i18n (next-intl)

Locales: `en` (default), `zh-CN`. Default locale has no URL prefix.

## Code Standards

This project uses **Ultracite** (Biome preset) for linting and formatting. Run `pnpm check` before committing.
