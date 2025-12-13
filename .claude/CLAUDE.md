# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack TypeScript monorepo built with the Better-T-Stack. It combines React 19, TanStack Start (SSR), oRPC (type-safe RPC), Drizzle ORM, PostgreSQL, and Better Auth.

## Commands

```bash
# Development
pnpm run dev          # Start all apps (web runs on port 3001)
pnpm run dev:web      # Start web app only

# Build & Type Check
pnpm run build        # Build all apps
pnpm run check-types  # TypeScript checking across all packages

# Code Quality (Biome via Ultracite)
npx ultracite fix     # Format and auto-fix issues
npx ultracite check   # Check for issues
pnpm run check        # Biome check with auto-fix

# Database (Drizzle + PostgreSQL)
pnpm run db:push      # Push schema changes to database
pnpm run db:generate  # Generate migrations
pnpm run db:migrate   # Run migrations
pnpm run db:studio    # Open Drizzle Studio UI
```

## Architecture

```
apps/web/                    # Fullstack TanStack Start app
├── src/routes/              # File-based routing
│   ├── (auth)/              # Auth pages (login, signup, etc.)
│   ├── (app)/               # Protected app routes
│   ├── (admin)/             # Admin routes
│   └── api/                 # API route handlers
├── src/components/
│   ├── ui/                  # shadcn/ui components (base-nova style)
│   ├── shared/              # Reusable components
│   └── features/            # Feature-specific components
├── src/lib/auth-client.ts   # Better Auth client with plugins
└── src/utils/orpc.ts        # oRPC client setup with TanStack Query

packages/
├── api/                     # oRPC routers and procedures
│   └── src/
│       ├── index.ts         # publicProcedure, protectedProcedure
│       ├── context.ts       # Request context with session
│       └── routers/         # API routers (auth, etc.)
├── auth/                    # Better Auth configuration
├── db/                      # Drizzle schema and migrations
│   └── src/schema/          # Database schemas
└── email/                   # React Email templates
```

## Key Patterns

### oRPC API Layer
- `publicProcedure` - Public endpoints, no auth required
- `protectedProcedure` - Requires authentication via middleware
- API endpoint: `/api/rpc`
- Client uses `createIsomorphicFn()` for SSR/client compatibility

### Authentication (Better Auth)
- Email/password, GitHub OAuth, Google OAuth
- Plugins: emailOTP, magicLink, admin
- User has additional `role` field (defaults to "USER")
- Client: `authClient` from `@/lib/auth-client`

### Database
- Drizzle ORM with PostgreSQL
- Schemas in `packages/db/src/schema/`
- Auth tables auto-managed by Better Auth

### TanStack Query Integration
- `orpc` utility wraps oRPC with TanStack Query hooks
- `queryClient` configured with error toast notifications

## Environment Variables

Required in `apps/web/.env`:
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Auth secret key
- `BETTER_AUTH_URL` - Auth base URL
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` - GitHub OAuth
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - Google OAuth
- `RESEND_API_KEY` - Email service

---

## Code Standards (Ultracite/Biome)

### Core Principles
Write code that is **accessible, performant, type-safe, and maintainable**.

### Type Safety
- Use explicit types for function parameters and return values
- Prefer `unknown` over `any`
- Use const assertions (`as const`) for immutable values
- Leverage type narrowing instead of type assertions

### Modern TypeScript/JavaScript
- Arrow functions for callbacks
- `for...of` over `.forEach()` and indexed loops
- Optional chaining (`?.`) and nullish coalescing (`??`)
- Template literals over string concatenation
- Destructuring for object/array assignments
- `const` by default, `let` only when needed, never `var`

### React & JSX
- Function components only
- Hooks at top level, never conditionally
- Complete hook dependency arrays
- `key` prop with unique IDs (not array indices)
- Semantic HTML and ARIA attributes
- React 19: Use ref as prop instead of `React.forwardRef`

### Async Code
- Always `await` promises in async functions
- `async/await` over promise chains
- Proper error handling with try-catch

### Error Handling
- Throw `Error` objects with descriptive messages
- Prefer early returns over nested conditionals
- Remove `console.log`, `debugger`, `alert` from production

### Security
- `rel="noopener"` with `target="_blank"`
- Avoid `dangerouslySetInnerHTML`
- No `eval()` or direct `document.cookie` assignment

Run `npx ultracite fix` before committing.
