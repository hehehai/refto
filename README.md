<div align="center">
  <img src="public/images/logo.svg" alt="Refto Logo" width="80" height="80" />
  <h1>Refto</h1>
  <p>Curated design references for creative inspiration</p>

  <p>
    <a href="https://refto.one">Website</a> •
    <a href="https://twitter.com/riverhohai">Twitter</a>
  </p>
</div>

---

## Features

- **Curated Design References** - Hand-picked high-quality design inspiration
- **Daily Updates** - Fresh content added regularly
- **Weekly Newsletter** - Get the best sites delivered to your inbox
- **Advanced Filtering** - Search and filter by tags and categories
- **User Submissions** - Submit your favorite sites for review
- **Admin Panel** - Full content management system

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 16 (App Router), React 19 |
| **Styling** | Tailwind CSS 4, shadcn/ui, Radix UI |
| **Database** | PostgreSQL, Drizzle ORM |
| **API** | oRPC, TanStack Query |
| **Auth** | Better Auth (Email OTP, GitHub, Google) |
| **Storage** | Cloudflare R2 |
| **Email** | React Email, Resend |
| **Validation** | Zod |
| **State** | Jotai, TanStack Query |
| **Tooling** | Biome (Ultracite), TypeScript, pnpm |

## Quick Start

### Prerequisites

- Node.js >= 20
- pnpm
- PostgreSQL

### Installation

```bash
# Clone the repository
git clone https://github.com/nicepkg/refto.git
cd refto

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Configure your .env file with:
# - DATABASE_URL (PostgreSQL connection)
# - BETTER_AUTH_SECRET
# - RESEND_API_KEY
# - Cloudflare R2 credentials
# - OAuth credentials (GitHub, Google)

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm check        # Lint and format (Biome)
pnpm db:studio    # Open Drizzle Studio
pnpm email:dev    # Preview email templates
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Better Auth](https://better-auth.com/) - Authentication library
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [oRPC](https://orpc.unnoq.com/) - End-to-end typesafe APIs
- [Resend](https://resend.com/) - Email delivery

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/nicepkg">nicepkg</a></p>
  
  <a href="#top">Back to top</a>
</div>
