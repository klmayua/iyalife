-- IyaLife Platform — Row Level Security
-- Run after 001_schema.sql, in the Supabase SQL Editor.

-- Enable RLS
alter table mothers enable row level security;
alter table orders enable row level security;
alter table referrals enable row level security;
alter table commission_events enable row level security;
alter table commission_payouts enable row level security;
alter table coupons enable row level security;
alter table products enable row level security;
alter table satisfaction_scores enable row level security;
alter table waitlist_emails enable row level security;
alter table referral_clicks enable row level security;

-- Mothers: read/update own profile only
create policy "mothers_own" on mothers
  for all using (auth.uid() = id);

-- Orders: mothers see only their orders
create policy "orders_own" on orders
  for all using (auth.uid() = mother_id);

-- Referrals: referrer sees their own referral relationships
create policy "referrals_referrer" on referrals
  for select using (auth.uid() = referrer_id);

-- Commissions: mothers see their own
create policy "commissions_own" on commission_events
  for select using (auth.uid() = referrer_id);

-- Payouts: mothers see their own, and can request a payout for themselves
create policy "payouts_own_select" on commission_payouts
  for select using (auth.uid() = mother_id);

create policy "payouts_own_insert" on commission_payouts
  for insert with check (auth.uid() = mother_id);

-- Products: public read
create policy "products_public" on products
  for select using (true);

-- Coupons: mothers see their own
create policy "coupons_own" on coupons
  for select using (auth.uid() = mother_id or mother_id is null);

-- Satisfaction scores: mothers can insert/read their own
create policy "satisfaction_own" on satisfaction_scores
  for all using (auth.uid() = mother_id);

-- Waitlist: anyone (including anonymous visitors) can submit their email
create policy "waitlist_public_insert" on waitlist_emails
  for insert with check (true);

-- Note: decision_log, mother_insights, success_stories, transactions are
-- founder/admin-only tables — no public policies. They must be accessed via
-- the service role key from apps/api or apps/admin, which bypasses RLS.
