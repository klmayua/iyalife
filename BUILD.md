# IyaLife — Claude Code Build Guide
# Astro-first. Sequenced. Copy-paste ready.
# Run all terminal commands from the project root: ~/projects/iyalife/

---

## STEP 0 — INITIAL SETUP (Terminal, not Claude Code)

```bash
# 1. Extract and enter the project
unzip IyaLife_Platform_v2_Frontend.zip
cd iyalife

# 2. Install dependencies
pnpm install

# 3. Environment
cp .env.example .env
# Open .env and fill in:
# - SUPABASE_URL and keys (from supabase.com → project → Settings → API)
# - PAYSTACK keys (from paystack.com → Settings → API)
# - Generate SECRET_KEY: openssl rand -hex 32

# 4. Verify everything runs
pnpm dev
# web  → http://localhost:4321
# admin → http://localhost:5173

# 5. Git setup
git init && git add . && git commit -m "feat: IyaLife v2 frontend complete"
gh repo create iyalife-platform --private --source=. --push
```

---

## STEP 1 — SUPABASE SCHEMA (Supabase Dashboard)

Before running Claude Code for anything data-related,
go to your Supabase project → SQL Editor → paste and run the full schema
from CLAUDE.md (the section titled "Supabase Schema — Build This First").

Then run these RLS policies in the same SQL editor:

```sql
-- Enable RLS
alter table mothers enable row level security;
alter table orders enable row level security;
alter table referrals enable row level security;
alter table commission_events enable row level security;
alter table commission_payouts enable row level security;
alter table coupons enable row level security;

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

-- Payouts: mothers see their own
create policy "payouts_own" on commission_payouts
  for select using (auth.uid() = mother_id);

-- Products: public read
create policy "products_public" on products
  for select using (true);

-- Coupons: mothers see their own
create policy "coupons_own" on coupons
  for select using (auth.uid() = mother_id or mother_id is null);
```

---

## STEP 2 — START CLAUDE CODE

```bash
# From your project root:
cd ~/projects/iyalife
claude
```

Claude Code reads CLAUDE.md automatically.
It knows the full build status, schema, brand system, and architecture.

---

## BUILD PROMPTS — COPY THESE INTO CLAUDE CODE ONE AT A TIME

Each prompt is a self-contained task. Complete one before starting the next.
The prompts are sequenced by dependency — earlier ones unblock later ones.

---

### PROMPT 01 — Astro Middleware (Auth Protection)

```
Create Astro middleware at apps/web/src/middleware.ts

The middleware should:
- Run on every request to /account/*, /cart, /checkout
- Check for a valid Supabase session using the Supabase client
- If no session: redirect to /auth/login
- If session exists: allow the request through and attach the user to locals
- Do NOT protect /join/*, /auth/*, /shop/*, /, /about, /earn, /community, /privacy, /terms, /contact

Use Astro's defineMiddleware and sequence from 'astro:middleware'.
Supabase client should use cookies for SSR session management via @supabase/ssr.
Update apps/web/package.json to add @supabase/ssr as a dependency.
Update apps/web/src/lib/supabase.ts to export both a browser client and a server client that reads cookies.
```

---

### PROMPT 02 — Referral Code Generation (Database Trigger)

```
In the Supabase SQL editor, I need you to write the SQL for:

1. A function that generates a human-readable referral code
   Format: first 3-4 letters of first name + 4 random digits
   Example: ADA-2607, NGOZI-1143, BISI-4421
   Must be unique in the mothers table.

2. A trigger that fires AFTER INSERT on the mothers table
   - Generates a referral code using the function above
   - Sets it on the new mother record
   - Also sets member_number to the next sequential value

3. A function that validates a referral code exists and is under the cap of 20 direct referrals
   Returns boolean.

Write this as executable SQL I can paste into the Supabase SQL editor.
```

---

### PROMPT 03 — Auth Register Flow (Complete the Supabase Integration)

```
Complete the registration flow in apps/web/src/pages/auth/register.astro

The submitRegistration function (in the <script> tag) currently:
- Verifies OTP ✅
- Creates a mother profile ✅

It needs to also:
1. After insert, fetch the generated referral_code from the mothers table for this user
2. Store the referral_code in localStorage so the account dashboard can display it immediately
3. If the referral_type is 'peer' (not 'advocate'), record the referral relationship:
   - Find the referrer's mother_id by looking up referred_by_code in the mothers table
   - Insert a record into the referrals table: {referrer_id, referred_id, referral_type}
4. Handle the case where the referral code is invalid gracefully (don't block registration)

Also update the account/index.astro page:
- The referral-link input should fetch the referral_code from supabase if localStorage is empty
- Display the full URL: window.location.origin + '/join/' + referral_code
```

---

### PROMPT 04 — Shop Page with Real Data

```
Update apps/web/src/pages/shop/index.astro to fetch real products from Supabase.

The page currently calls getProducts() from lib/supabase.ts which queries the products table.
Make sure:
1. The query in lib/supabase.ts orders by created_at DESC and filters in_stock = true
2. Add a search input to the shop page (filter client-side on product name)
3. If no products exist yet, show a "Coming soon" message per category with an email capture field
4. The category filter tabs should show the count of products per category in brackets

Also update apps/web/src/pages/shop/[slug].astro:
- The getProduct() function should use the slug parameter
- Add a "Related products" section at the bottom (same category, limit 4, exclude current)
- Add breadcrumb navigation
```

---

### PROMPT 05 — Cart Persistence

```
The cart in apps/web/src/stores/cart.ts uses nanostores in-memory state.
It resets on page navigation in Astro.

Fix this by:
1. Adding localStorage persistence to the cart store
   - On cartItems change: save to localStorage key 'iyalife-cart'
   - On store init: load from localStorage if it exists
   - Handle JSON parse errors gracefully
2. Update the Nav component to show a cart item count badge
   - Add a cart icon link to /cart in the nav
   - Show the count from cartCount store
   - The badge should use @nanostores/react as a React island (client:load)
3. Create apps/web/src/components/CartBadge.tsx as the React island

Make sure the localStorage reads and writes only happen client-side (check typeof window !== 'undefined').
```

---

### PROMPT 06 — Paystack Webhook Handler

```
Create apps/api/app/routers/webhooks.py

This FastAPI router handles Paystack webhooks:

1. POST /webhooks/paystack
   - Verify the webhook signature using PAYSTACK_SECRET_KEY from config
     (HMAC-SHA512 of the raw request body, compared to x-paystack-signature header)
   - On event 'charge.success':
     a. Update the order status to 'confirmed' where paystack_reference matches
     b. Calculate commission: find the mother who placed the order → find their referrer
        from the referrals table → calculate Level 1 commission at 8% of order amount
        (store the rate from supplier_rates table if it exists, else default 8%)
     c. Insert a commission_event record
     d. Update the referrer's pending_earnings in the mothers table
     e. Increment mother's total_orders count
   - On event 'transfer.success': update commission_payouts status to 'paid'
   - Return 200 OK immediately regardless (Paystack requires fast response)
   - Log all webhook events with timestamp for audit

2. Register this router in apps/api/app/main.py with prefix /webhooks

Use Supabase service role key for all database operations (bypasses RLS).
```

---

### PROMPT 07 — n8n Welcome Sequence

```
Create a file at n8n/workflows/welcome_sequence.json

This is an n8n workflow that fires when a new mother registers.
The trigger is a webhook POST from the Supabase auth.users insert hook.

The workflow sequence (with delays):

Node 1 — Trigger: Webhook (POST /welcome)
  Input: { user_id, phone, full_name, referrer_name, member_number }

Node 2 — Delay: 0 seconds
  Send Welcome Letter via WhatsApp Business API
  Template: personalised letter with full_name, referrer_name, member_number
  Use HTTP Request node to POST to WhatsApp Business API

Node 3 — Delay: 60 seconds after Node 2
  Trigger data bundle delivery
  HTTP POST to Africa's Talking Data Bundle API
  Body: { phone, bundle: '2GB-30days' }
  On failure: retry 3x at 10-minute intervals, then send WhatsApp fallback

Node 4 — Delay: 120 seconds
  Send Founding Member badge via WhatsApp
  HTTP POST with image URL and caption including member_number

Node 5 — Delay: 180 seconds
  Send first purchase coupon code via WhatsApp
  Fetch coupon from Supabase where mother_id = user_id

Node 6 — Wait: 3 days
  Send Health Line introduction
  WhatsApp message introducing Dr. [NAME] with direct contact

Node 7 — Wait: 7 days
  Send Uradi access unlock notification

Node 8 — Wait: 14 days
  Check if first purchase made (query Supabase orders)
  If no purchase: send re-engagement message with coupon reminder

Write this as valid n8n workflow JSON that can be imported directly.
Note: Replace [WHATSAPP_TOKEN], [WHATSAPP_PHONE_ID], [AFRICA_TALKING_KEY] with placeholders.
```

---

### PROMPT 08 — Admin Tailwind Fix

```
The apps/admin app uses Tailwind CSS but the brand color classes
(bg-brand-teal, text-brand-gold, etc.) may not resolve correctly.

Fix this:
1. Create apps/admin/tailwind.config.ts that extends the shared config from packages/ui/tailwind.config.ts
2. Update apps/admin/src/index.css to import Tailwind correctly
3. Update apps/admin/vite.config.ts to handle the workspace package import
4. Verify all brand color classes work by checking apps/admin/src/pages/Dashboard.tsx

The shared tokens are in packages/ui/src/tokens.ts.
The brand colors must match exactly:
  teal: #0B7285, dark-teal: #06424D
  gold: #C9A24A, dark-gold: #8C6D2F
  ink: #1F2A2E, muted: #5B6B6E, surface: #F8F7F4
```

---

### PROMPT 09 — Products Admin (Add Product Form)

```
The Products page in apps/admin/src/pages/ProductsSettings.tsx has an "+ Add Product" button
that does nothing. Build the add product form:

1. When "+ Add Product" is clicked, show a slide-over panel (not a modal)
   The slide-over appears from the right, overlays the page
2. Form fields:
   - Product name (text, required)
   - Slug (auto-generated from name, editable)
   - Category (select: baby-care, maternal-health, household, child-development)
   - Price in NGN (number, required)
   - Original price (number, optional — for showing crossed-out price)
   - Description (textarea)
   - Image URL (text, optional)
   - In stock (toggle, default true)
   - Founding deal (toggle, default false)
3. On submit: insert into Supabase products table, close panel, refresh list
4. On product row click: open the same panel pre-filled for editing
5. Add a delete button with confirmation dialog

Use the existing useQuery hook pattern from hooks/useSupabase.ts.
```

---

### PROMPT 10 — Metrics Dashboard (Real Data)

```
The admin Dashboard and Metrics pages show placeholder "—" values.
Wire them to real Supabase data.

Create apps/admin/src/hooks/useMetrics.ts that computes:

Commercial metrics (query from orders, referrals, commission_events):
- repeat_purchase_rate: % of mothers with >1 order in last 60 days
- gross_margin_per_order: average order value * 0.15 (Phase Zero default margin)
- referral_activation_rate: % of mothers who referred ≥1 person within 30 days of joining
- referral_conversion_rate: % of referred mothers who placed ≥1 order

Mission metrics (query from mothers, success_stories, mother_insights):
- mother_onboarding_rate: count of new mothers in current month
- satisfaction_index: average from a satisfaction_scores table (create if not exists, default null)
- success_stories_captured: count in current quarter
- value_exchanges_recorded: count of orders + referrals + community interactions this month
- community_engagement_rate: % of mothers active in last 7 days (last_seen field, add to mothers table)

Update Dashboard.tsx and Metrics.tsx to use this hook.
Show the actual computed values with correct formatting.
Add a "Last updated" timestamp.
```

---

### PROMPT 11 — PWA Icons

```
The PWA manifest references /icons/icon-192.png and /icons/icon-512.png
which don't exist yet.

Generate these using the existing favicon.svg design:
- Mother figure in gold (#C9A24A)
- Baby figure in teal (#0B7285)
- Both on a white background with rounded corners

Since we can't generate real PNG files here, create:
1. apps/web/public/icons/icon.svg — a proper square SVG version of the logomark
   with a teal (#0B7285) background and centered mother+baby figures
   This can be used as a mask for the PWA icons

2. Update apps/web/public/manifest.json to also reference the SVG:
   { "src": "/icons/icon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any maskable" }

3. Add this to apps/web/src/layouts/BaseLayout.astro head:
   <link rel="apple-touch-icon" href="/icons/icon.svg" />

Note: For production PNG icons, use a tool like pwa-asset-generator or Squoosh
after the SVG is confirmed correct.
```

---

### PROMPT 12 — Backend API (Complete the Stubs)

```
Complete all the TODO stubs in apps/api/app/routers/ with real Supabase queries.

For each router, use the supabase-py client initialized from config.settings.

apps/api/app/routers/auth.py:
- POST /auth/register: validate referral code exists, create mother profile, generate referral code
- POST /auth/login: initiate Supabase OTP
- POST /auth/verify: verify OTP, return session

apps/api/app/routers/mothers.py:
- GET /mothers/: query mothers table with tier filter and pagination
- GET /mothers/{id}: fetch single mother with earnings summary
- POST /mothers/: insert new mother, record referral relationship
- GET /mothers/{id}/referrals: fetch referral chain for this mother
- GET /mothers/{id}/orders: fetch order history

apps/api/app/routers/orders.py:
- GET /orders/: list orders with optional status filter
- POST /orders/: create order, store Paystack reference

apps/api/app/routers/referrals.py:
- GET /referrals/: list all referral relationships
- POST /referrals/track: record a referral click event

apps/api/app/routers/products.py:
- GET /products/: list products with category filter
- GET /products/categories: return the 4 categories with counts

apps/api/app/routers/metrics.py:
- GET /metrics/summary: compute and return all 9 metrics for the requested period
- POST /metrics/success-stories: insert a verified success story

Also create apps/api/app/lib/supabase.py with a properly initialized Supabase client
using the service role key from config.settings for admin operations.
```

---

### PROMPT 13 — Referral Join Page Enhancement

```
Enhance apps/web/src/pages/join/[code].astro

Currently it shows the referrer's name and an "Accept the invitation" button.

Add:
1. Member count display — query the total founding members count from mothers table
   Show: "Join [X] founding members" — creates social proof and scarcity signal
   Cap display at 1,000 total. Never show the gap (e.g., don't say "only 200 spots left")
   Just show the growing count.

2. The referrer's tier badge should be styled correctly:
   Silver: gray badge, Gold: amber badge, Diamond: blue badge
   
3. The page should handle the advocate referral type (t=advocate param):
   Different headline: "[Name] is gifting you access to IyaLife."
   Slightly warmer, gift-oriented copy

4. If the referral code has hit its 20-referral cap:
   Show: "This invitation link is no longer active. The member who shared it
   has reached their founding circle limit. Ask them to connect you with another member."
   Do NOT show the registration button.
   Query the count of referrals where referrer_id = this mother's id.

5. Add Open Graph meta tags to the page so WhatsApp previews render correctly:
   og:title: "[Name] invited you to IyaLife"
   og:description: "IyaLife is an invitation-only community for mothers."
   og:image: The IyaLife logomark (use a hosted URL or data URI)
```

---

### PROMPT 14 — Account Earnings (Wire Payout Request)

```
Complete apps/web/src/pages/account/earnings.astro

The payout flow is missing. Add:

1. A "Request Payout" button that appears when pending_earnings >= 500 (the minimum threshold)
   - If BVN not verified: button shows "Verify identity to withdraw" → links to profile
   - If BVN verified and pending >= 500: shows "Request Payout" button
   - On click: POST to /api/request-payout (create this Astro API endpoint)

2. Create apps/web/src/pages/api/request-payout.ts as an Astro API route:
   - Verifies session
   - Checks pending_earnings >= 500
   - Checks bvn_verified = true
   - Inserts record into commission_payouts table with status='pending'
   - Returns success message
   - This queues the payout for Friday processing

3. The monthly renewal status section:
   - Show last renewal date
   - Show whether this month's condition is met (has 1 order or 1 referral this month)
   - Show next renewal date (30 days from last renewal)
   - Green if condition met, amber if approaching deadline, red if lapsed

4. Add a "Share my earnings" button:
   - Generates a WhatsApp message: "I earned ₦[amount] this month recommending products
     to other mothers on IyaLife. You can too. [referral_link]"
   - This is the organic growth mechanic — earned income as social proof
```

---

### PROMPT 15 — Final Integration Test

```
Run a complete integration test of the IyaLife web app. Check each of these flows:

1. REFERRAL GATE TEST
   - Visit iyalife.com/join/INVALID-CODE → should show "invite only" message, no register button
   - Visit iyalife.com/join/VALID-CODE → should show referrer name and "Accept invitation" button
   - The register button should link to /auth/register?ref=VALID-CODE

2. REGISTRATION FLOW TEST
   - Visit /auth/register without ?ref param → should show the hard gate message (403-style)
   - Visit /auth/register?ref=VALID-CODE → three steps should render: info → questions → OTP
   - All three questions should be selectable with visual feedback

3. AUTH PROTECTION TEST
   - Visit /account without being logged in → should redirect to /auth/login
   - Visit /cart without being logged in → should redirect to /auth/login

4. SHOP FLOW TEST
   - Visit /shop → categories should render, product grid shows (or empty state)
   - Click a product → product detail page renders with correct data
   - "Add to cart" → cart count in nav should increment

5. CART AND CHECKOUT TEST
   - Visit /cart with items → shows items, quantities changeable, total correct
   - Visit /checkout → form renders, Paystack button visible

For each test, identify what is working, what errors appear in the browser console,
and what needs fixing. Fix any TypeScript errors, missing imports, or broken routes.
Report the results as a checklist.
```

---

## DEPLOYMENT PROMPTS

After all prompts above are complete and the local build passes:

### DEPLOY TO VERCEL (Web)

```
Prepare apps/web for Vercel deployment.

1. Confirm astro.config.ts has adapter: vercel() from @astrojs/vercel/serverless
2. Add all PUBLIC_ environment variables to Vercel:
   vercel env add PUBLIC_SUPABASE_URL
   vercel env add PUBLIC_SUPABASE_ANON_KEY  
   vercel env add PUBLIC_PAYSTACK_PUBLIC_KEY
3. Update apps/web/vercel.json if any routes need specific handling
4. Run: cd apps/web && vercel --prod
```

### DEPLOY TO VERCEL (Admin)

```
Prepare apps/admin for Vercel deployment.

1. Ensure vite.config.ts builds correctly: pnpm --filter @iyalife/admin build
2. Add environment variables:
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   vercel env add VITE_API_URL (= your Railway API URL)
3. Run: cd apps/admin && vercel --prod
```

### DEPLOY TO RAILWAY (API)

```
Prepare apps/api for Railway deployment.

1. Verify railway.toml has correct startCommand
2. Set all environment variables in Railway dashboard:
   ENVIRONMENT=production
   SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_KEY
   PAYSTACK_SECRET_KEY
   WHATSAPP_TOKEN, TELEGRAM_BOT_TOKEN
   SECRET_KEY
3. Run: cd apps/api && railway up
4. Set custom domain: api.iyalife.com in Railway dashboard
```

---

## QUICK REFERENCE

```bash
# Run everything
pnpm dev

# Build everything
pnpm build

# Type check
pnpm typecheck

# Push and auto-deploy (Vercel watches main branch)
git add . && git commit -m "feat: [describe]" && git push

# Check logs
vercel logs     # web/admin
railway logs    # api
```

---

## SEQUENCING RULE

Do not skip ahead. Each prompt assumes the previous is working.

The critical path is:
Schema → Auth Middleware → Referral Code Generation → Registration Flow → Shop Data → Cart Persistence → Webhook → Metrics

Everything else can be parallelised after the critical path is done.
EOF