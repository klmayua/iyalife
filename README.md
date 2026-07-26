# IyaLife Platform

> The world's most trusted institution for motherhood.

## Architecture

```
iyalife/
├── apps/
│   ├── web/      — Customer-facing (Astro + TypeScript, PWA, mobile-first)
│   ├── admin/    — Internal tooling (React + Vite, TypeScript)
│   └── api/      — Backend (FastAPI, Python 3.12+)
├── packages/
│   ├── ui/       — Shared brand component library (React, Tailwind)
│   └── config/   — Shared configuration and types
├── docker-compose.yml
└── turbo.json
```

## Stack

| Layer      | Technology                |
|------------|---------------------------|
| Web        | Astro 4, TypeScript       |
| Admin      | React 18, Vite, TypeScript|
| API        | FastAPI, Python 3.12      |
| Database   | Supabase (managed Postgres)|
| Payments   | Paystack                  |
| Automation | n8n (self-hosted)         |
| Messaging  | WhatsApp Business + Telegram |
| Styling    | Tailwind CSS + Inter       |
| Monorepo   | pnpm workspaces + Turborepo |
| Deploy     | Docker Compose + VPS      |

## Brand

- **Teal** `#0B7285` — Institutional Teal (primary)
- **Gold** `#C9A24A` — Warm Gold (accent)
- **Typeface** — Inter
- **Logomark** — Mother (gold) + Baby (teal)
- **Wordmark** — **Iya** (gold) + **Life** (teal)

## Tiers

| Tier    | Description          |
|---------|----------------------|
| ◆ Silver | Entry earner         |
| ◆ Gold   | Established earner   |
| ◆ Diamond | Community anchor    |

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Fill in your Supabase, Paystack, and messaging credentials

# Run all apps in development
pnpm dev

# Run individual app
pnpm --filter @iyalife/web dev
pnpm --filter @iyalife/admin dev
pnpm --filter @iyalife/api dev   # uvicorn app.main:app --reload
```

## Subdomains

| App   | Domain                  |
|-------|-------------------------|
| Web   | iyalife.com             |
| Admin | admin.iyalife.com       |
| API   | api.iyalife.com         |
| n8n   | n8n.iyalife.com         |

## Guiding Principle

> "Does this make motherhood more secure, more supported, more prosperous?"
>
> — IyaLife Founding Bible, 2.10
