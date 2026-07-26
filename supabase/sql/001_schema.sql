-- IyaLife Platform — Base Schema
-- Run this first, in the Supabase SQL Editor. Source of truth: BuildDocs/Platform/CLAUDE.md.

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
  last_seen        timestamptz,
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

-- Satisfaction scores (used by admin mission metrics — apps/admin/src/hooks/useMetrics.ts)
create table satisfaction_scores (
  id          uuid primary key default gen_random_uuid(),
  mother_id   uuid references mothers,
  score       int not null check (score between 1 and 5),
  comment     text,
  created_at  timestamptz default now()
);

-- Waitlist emails (shop "coming soon" category notify-me capture)
create table waitlist_emails (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  category    text,
  created_at  timestamptz default now()
);

-- Referral link click tracking (POST /referrals/track — apps/api)
create table referral_clicks (
  id             uuid primary key default gen_random_uuid(),
  referral_code  text not null,
  source         text,
  created_at     timestamptz default now()
);
