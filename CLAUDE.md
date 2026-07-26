# IyaLife Platform — Claude Code Context
# Version 2.0 — Full Frontend Build Complete

## What this project is

IyaLife is a motherhood-centered commerce, community, and empowerment institution.
Unified Phase Zero platform: customer-facing Astro web app, React admin dashboard,
FastAPI backend — monorepo. Invitation-only. Trust-first. Built for African mothers.

Guiding Principle (apply to every decision):
> "Does this make motherhood more secure, more supported, more prosperous?"
> — IyaLife Founding Bible, 2.10

---

## Current Build Status

### ✅ COMPLETE — Frontend (apps/web + apps/admin)

**apps/web (Astro) — ALL PAGES BUILT:**
- Marketing: / (home), /about, /shop, /shop/[slug], /earn, /community
- Auth: /auth/login, /auth/register (referral-gated, OTP, 3-question onboarding)
- Referral gate: /join/[code] (personalised landing, peer/advocate flow)
- Member: /account, /account/orders, /account/earnings, /account/profile
- Commerce: /cart, /checkout, /checkout/success
- Static: /privacy, /terms, /contact
- PWA: manifest.json, favicon.svg

**apps/admin (React) — ALL PAGES BUILT:**
- Dashboard (9 metrics, commercial + mission split)
- Orders (full management, status updates)
- Mothers (search, tier filter, verification status)
- Referrals (network table, payout queue, approve flow)
- Finance (ICAN ledger, P&L, capital allocation)
- Decisions (Decision Log, PRINCE2 business case form)
- Insights (Mother Insights log, success stories)
- Metrics (all 9 KPIs, recharts trend graph)
- Products + Settings

**packages/ui — COMPLETE:**
Button, Card, Input, Badge, TierBadge, MetricCard, Logo
Brand tokens, Tailwind config, cn() utility

### ❌ TODO — Backend (apps/api)
All FastAPI routers are stubs. Supabase queries not yet written.
Build backend AFTER confirming frontend runs correctly.

### ❌ TODO — Supabase Schema
Database tables not yet created. Build this first before any data flows.

---

## Monorepo Structure

```
iyalife/
├── apps/
│   ├── web/                    Astro 4 — customer-facing (TypeScript, PWA)
│   │   └── src/
│   │       ├── components/     Nav, Footer, ProductCard
│   │       ├── layouts/        BaseLayout, AuthLayout
│   │       ├── lib/            supabase.ts (client + helpers)
│   │       ├── stores/         cart.ts (nanostores), auth.ts
│   │       └── pages/          All pages listed above
│   ├── admin/                  React 18 + Vite — internal dashboard
│   │   └── src/
│   │       ├── components/     Sidebar, DataTable
│   │       ├── hooks/          useSupabase.ts
│   │       └── pages/          All admin pages listed above
│   └── api/                    FastAPI — Python 3.12 (stubs, needs completion)
└── packages/
    └── ui/                     Shared brand component library
```

---

## Tech Stack

| Layer      | Technology                          | Status    |
|------------|-------------------------------------|-----------|
| Web        | Astro 4, TypeScript, @astrojs/vercel| ✅ Built  |
| Admin      | React 18, Vite, React Router        | ✅ Built  |
| UI Library | Tailwind CSS + Inter + custom tokens| ✅ Built  |
| API        | FastAPI, Python 3.12, Pydantic v2   | ⚠️ Stubs  |
| Database   | Supabase (managed Postgres)         | ❌ Schema needed |
| Payments   | Paystack (integrated in checkout)   | ⚠️ Keys needed |
| Automation | n8n (self-hosted)                   | ❌ Workflows needed |
| Messaging  | WhatsApp Business + Telegram Bot    | ❌ Tokens needed |
| Deploy     | Vercel (web+admin) + Railway (api)  | ⚠️ Config ready |

---

## Brand System (NEVER DEVIATE)

```
Teal:        #0B7285  — primary, headings, buttons, "Life" in wordmark
Dark Teal:   #06424D  — dark backgrounds, sidebar
Gold:        #C9A24A  — accent, CTAs, "Iya" in wordmark, mother figure in logo
Dark Gold:   #8C6D2F  — emphasis
Ink:         #1F2A2E  — body text
Muted:       #5B6B6E  — captions
Surface:     #F8F7F4  — background
```

Typeface: Inter (always)
Logomark: mother (gold) + baby (teal)
Wordmark: "Iya" gold · "Life" teal
Tiers: ◆ Silver → ◆ Gold → ◆ Diamond

---

## Supabase Schema — Build This First

```sql
-- Mothers (primary constituency)
create table mothers (
  id               uuid primary key references auth.users,
  full_name        text not null,
  phone            text not null unique,
  email            text,
  tier             text default 'silver' check (tier in ('silver','gold','diamond')),
  referral_code    text unique not null,
  referred_by_code text references mothers(referral_code),
  referral_type    text default 'peer' check (referral_type in ('peer','advocate','institutional')),
  member_number    serial,
  is_founding      boolean default true,
  bvn_verified     boolean default false,
  journey_stage    text,
  challenge        text,
  help_needed      text,
  total_earned     numeric default 0,
  pending_earnings numeric default 0,
  paid_out         numeric default 0,
  total_orders     int default 0,
  total_referrals  int default 0,
  created_at       timestamptz default now()
);

-- Products
create table products (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text unique not null,
  category         text not null check (category in ('baby-care','maternal-health','household','child-development')),
  price            numeric not null,
  original_price   numeric,
  description      text,
  image            text,
  in_stock         boolean default true,
  is_founding_deal boolean default false,
  supplier_id      uuid,
  created_at       timestamptz default now()
);

-- Orders
create table orders (
  id                  uuid primary key default gen_random_uuid(),
  mother_id           uuid references mothers not null,
  status              text default 'pending' check (status in ('pending','confirmed','delivered','cancelled')),
  total_amount        numeric not null,
  items               jsonb not null,
  paystack_reference  text unique,
  delivery_name       text,
  delivery_phone      text,
  delivery_address    text,
  coupon_code         text,
  created_at          timestamptz default now()
);

-- Referrals
create table referrals (
  id               uuid primary key default gen_random_uuid(),
  referrer_id      uuid references mothers not null,
  referred_id      uuid references mothers not null,
  referral_type    text default 'peer',
  commission_total numeric default 0,
  created_at       timestamptz default now(),
  unique(referrer_id, referred_id)
);

-- Commissions
create table commission_events (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid references orders not null,
  referrer_id  uuid references mothers not null,
  referred_id  uuid references mothers not null,
  level        int check (level in (1,2)),
  rate         numeric not null,
  amount       numeric not null,
  status       text default 'pending' check (status in ('pending','confirmed','paid')),
  created_at   timestamptz default now()
);

-- Payouts
create table commission_payouts (
  id          uuid primary key default gen_random_uuid(),
  mother_id   uuid references mothers not null,
  amount      numeric not null,
  period_end  date not null,
  status      text default 'pending' check (status in ('pending','approved','paid','failed')),
  paystack_ref text,
  created_at  timestamptz default now()
);

-- Coupons
create table coupons (
  id           uuid primary key default gen_random_uuid(),
  code         text unique not null,
  discount_pct int not null,
  mother_id    uuid references mothers,
  used         boolean default false,
  expires_at   timestamptz,
  created_at   timestamptz default now()
);

-- Decision Log
create table decision_log (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  decision         text not null,
  rationale        text,
  category         text not null,
  bible_reference  text,
  doctrine         text,
  expected_outcome text,
  created_by       text default 'founder',
  created_at       timestamptz default now()
);

-- Mother Insights
create table mother_insights (
  id          uuid primary key default gen_random_uuid(),
  category    text not null,
  signal      text not null,
  implication text,
  source      text,
  created_at  timestamptz default now()
);

-- Success Stories
create table success_stories (
  id          uuid primary key default gen_random_uuid(),
  mother_id   uuid references mothers,
  category    text not null,
  description text not null,
  verified    boolean default false,
  created_at  timestamptz default now()
);

-- Transactions (ICAN ledger)
create table transactions (
  id          uuid primary key default gen_random_uuid(),
  type        text not null,
  amount      numeric not null,
  reference   text,
  description text,
  created_at  timestamptz default now()
);
```

---

## Running the Project

```bash
# Install all workspaces
pnpm install

# Run all apps simultaneously
pnpm dev

# Individual apps
pnpm --filter @iyalife/web dev      # → http://localhost:4321
pnpm --filter @iyalife/admin dev    # → http://localhost:5173

# API (run separately)
cd apps/api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload      # → http://localhost:8000

# Type check everything
pnpm typecheck
```

---

## Environment Variables

```bash
cp .env.example .env
# Fill in:
# SUPABASE_URL + SUPABASE_ANON_KEY + SUPABASE_SERVICE_KEY
# PAYSTACK_SECRET_KEY + PAYSTACK_PUBLIC_KEY
# WHATSAPP_TOKEN + TELEGRAM_BOT_TOKEN
# SECRET_KEY (generate: openssl rand -hex 32)
```

---

## Coding Standards

### Astro (apps/web)
- Hybrid output — SSR for dynamic, static for marketing pages
- Supabase client: import from `../../lib/supabase`
- Cart state: import from `../../stores/cart`
- Auth state: import from `../../stores/auth`
- Always mobile-first — test at 375px
- Brand classes via Tailwind: `bg-brand-teal`, `text-brand-gold`, etc.
- Every protected page checks session and redirects to /auth/login

### React (apps/admin)
- Functional components only
- Data fetching via `useQuery` hook from `../hooks/useSupabase`
- Shared components from `@iyalife/ui`
- All tables use `DataTable` component from `../components/DataTable`

### Python (apps/api)
- FastAPI with async def throughout
- Pydantic v2 models for all schemas
- Supabase client via `supabase-py`
- Config via `app.config.settings` only — never os.environ directly
- All TODO comments in routers need replacing with real Supabase queries

---

## What Needs Building Next (Priority Order)

1. **Supabase schema** — run the SQL above in Supabase SQL editor first
2. **Row Level Security (RLS)** — mothers can only read their own data
3. **Auth middleware** — Astro middleware to protect /account/* routes
4. **Backend routers** — replace all TODO stubs in apps/api with real queries
5. **n8n workflows** — referral notification, data bundle delivery, welcome sequence
6. **Referral code generation** — auto-generate on mother account creation
7. **Commission calculation** — trigger on order confirmed, write to commission_events
8. **Paystack webhook** — verify payment, update order status, trigger commission
9. **Africa's Talking integration** — data bundle delivery on registration OTP confirm
10. **Admin tailwind config** — add the shared tailwind config properly

---

## Architecture Decisions (LOCKED — do not revisit)

- Astro (not Next.js) — mobile-first, low-bandwidth African markets
- Supabase (not self-hosted Postgres) — managed, Phase Zero velocity
- Paystack (not Stripe) — African market coverage
- n8n self-hosted (not Zapier) — data stewardship, no per-task cost
- WhatsApp + Telegram both — channel-agnostic access
- No native app in Phase Zero — PWA sufficient
- Referral: 2 levels max — beyond is MLM territory
- Peer referrers earn ongoing commission; advocate referrers earn one-time only

---

## Institutional Context

Primary constituency: **Mothers**. Every product decision tested here first.
Referral system: invitation-only, silence-as-strategy, experience is the campaign.
Monthly data benefit: 2GB via Africa's Talking, renewal conditional on 1 order/referral/month.
The founding circle closes at 1,000 members. Permanently.
