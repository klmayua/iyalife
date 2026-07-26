# IyaLife Platform — Setup, Push & Deploy Guide
# Run these commands in your terminal, in order.
# Every command is on its own line. Copy one block at a time.

# ═══════════════════════════════════════════════════════════════
# STEP 1 — PREREQUISITES
# Install the tools you need (skip any you already have)
# ═══════════════════════════════════════════════════════════════

# Node.js 20+ — https://nodejs.org
node --version   # should show v20.x or higher

# pnpm (faster than npm, required for workspaces)
npm install -g pnpm
pnpm --version

# GitHub CLI — https://cli.github.com
# macOS:
brew install gh
# Ubuntu/Debian:
sudo apt install gh
# Windows: winget install GitHub.cli

# Vercel CLI
pnpm install -g vercel

# Claude Code CLI (for AI-assisted development)
# https://docs.anthropic.com/en/docs/claude-code
npm install -g @anthropic-ai/claude-code


# ═══════════════════════════════════════════════════════════════
# STEP 2 — EXTRACT AND ENTER THE PROJECT
# ═══════════════════════════════════════════════════════════════

# Unzip the scaffold you downloaded
unzip IyaLife_Platform_Scaffold.zip
cd iyalife

# Verify structure
ls -la


# ═══════════════════════════════════════════════════════════════
# STEP 3 — ENVIRONMENT VARIABLES
# ═══════════════════════════════════════════════════════════════

# Copy the example env file
cp .env.example .env

# Open and fill in your credentials:
# - SUPABASE_URL and keys (from supabase.com → your project → Settings → API)
# - PAYSTACK_SECRET_KEY and PUBLIC_KEY (from paystack.com → Settings → API)
# - WHATSAPP_TOKEN (from Meta Developer Console)
# - TELEGRAM_BOT_TOKEN (from @BotFather on Telegram)
# - SECRET_KEY: generate one with:
openssl rand -hex 32

# Edit .env with your preferred editor:
nano .env
# or: code .env


# ═══════════════════════════════════════════════════════════════
# STEP 4 — INSTALL DEPENDENCIES
# ═══════════════════════════════════════════════════════════════

pnpm install


# ═══════════════════════════════════════════════════════════════
# STEP 5 — INITIALISE GIT
# ═══════════════════════════════════════════════════════════════

git init
git add .
git commit -m "feat: initial IyaLife platform scaffold

Phase Zero monorepo — Astro web, React admin, FastAPI backend.
Shared UI component library with IyaLife brand (teal/gold, Inter).
Docker Compose + Vercel + Railway deployment configs.

Built: July 1, 2026"


# ═══════════════════════════════════════════════════════════════
# STEP 6 — CREATE GITHUB REPOSITORY AND PUSH
# ═══════════════════════════════════════════════════════════════

# Authenticate with GitHub (opens browser)
gh auth login

# Create private repo and push in one command
gh repo create iyalife-platform \
  --private \
  --description "IyaLife unified platform — Phase Zero" \
  --source=. \
  --remote=origin \
  --push

# Verify it's live
gh repo view --web


# ═══════════════════════════════════════════════════════════════
# STEP 7 — DEPLOY WEB APP TO VERCEL (iyalife.com)
# ═══════════════════════════════════════════════════════════════

cd apps/web

# Login to Vercel
vercel login

# Deploy (follow the prompts)
# When asked:
#   - Set up and deploy? Y
#   - Which scope? → your account
#   - Link to existing project? N
#   - Project name? iyalife-web
#   - In which directory is your code? ./  (you're already in apps/web)
#   - Override settings? N
vercel

# Add environment variables to Vercel
vercel env add PUBLIC_SUPABASE_URL
vercel env add PUBLIC_SUPABASE_ANON_KEY
vercel env add PUBLIC_PAYSTACK_PUBLIC_KEY
# (Vercel will prompt you to paste each value)

# Deploy to production
vercel --prod

# Set your custom domain (after DNS is pointed)
vercel domains add iyalife.com

cd ../..


# ═══════════════════════════════════════════════════════════════
# STEP 8 — DEPLOY ADMIN TO VERCEL (admin.iyalife.com)
# ═══════════════════════════════════════════════════════════════

cd apps/admin

vercel
# When asked:
#   - Project name? iyalife-admin
#   - Directory? ./

vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_API_URL
# VITE_API_URL = https://api.iyalife.com (your Railway URL once deployed)

vercel --prod
vercel domains add admin.iyalife.com

cd ../..


# ═══════════════════════════════════════════════════════════════
# STEP 9 — DEPLOY API TO RAILWAY (api.iyalife.com)
# ═══════════════════════════════════════════════════════════════

# Install Railway CLI
npm install -g @railway/cli

# Login (opens browser)
railway login

# Inside the api directory
cd apps/api

# Initialise Railway project
railway init
# When asked: create new project → iyalife-api

# Add environment variables
railway variables set ENVIRONMENT=production
railway variables set SUPABASE_URL=your-supabase-url
railway variables set SUPABASE_KEY=your-supabase-anon-key
railway variables set SUPABASE_SERVICE_KEY=your-service-key
railway variables set PAYSTACK_SECRET_KEY=your-paystack-secret
railway variables set SECRET_KEY=your-secret-key
railway variables set WHATSAPP_TOKEN=your-token
railway variables set TELEGRAM_BOT_TOKEN=your-token

# Deploy
railway up

# Add custom domain in Railway dashboard:
# Project → Settings → Domains → api.iyalife.com

cd ../..


# ═══════════════════════════════════════════════════════════════
# STEP 10 — USING CLAUDE CODE FOR DEVELOPMENT
# ═══════════════════════════════════════════════════════════════

# Claude Code is an AI coding assistant in your terminal.
# Run it from the project root to get full codebase context.

cd iyalife
claude

# Once inside Claude Code, you can ask it to:
#
# Build out features:
#   "Build the shop page with product grid and add-to-cart"
#   "Complete the orders router in the FastAPI backend"
#   "Build the financial ledger page in the admin dashboard"
#   "Implement Paystack payment flow in the checkout page"
#
# Connect to Supabase:
#   "Set up the Supabase schema for mothers, orders, and referrals"
#   "Replace the TODO comments in mothers.py with real Supabase queries"
#
# Build n8n workflows:
#   "Create an n8n workflow that sends a WhatsApp message when an order is placed"
#
# Fix issues:
#   "The Astro build is failing with this error: [paste error]"
#
# Review doctrine alignment:
#   "Does this feature align with the IyaLife Guiding Principle?"

# Claude Code reads your entire codebase and can make changes
# across multiple files simultaneously.


# ═══════════════════════════════════════════════════════════════
# STEP 11 — ONGOING DEVELOPMENT WORKFLOW
# ═══════════════════════════════════════════════════════════════

# Run all apps locally
pnpm dev

# Individual apps
pnpm --filter @iyalife/web dev      # → http://localhost:4321
pnpm --filter @iyalife/admin dev    # → http://localhost:5173
# API: cd apps/api && uvicorn app.main:app --reload  # → http://localhost:8000

# Build all
pnpm build

# Push changes to GitHub (auto-deploys via Vercel + Railway CI)
git add .
git commit -m "feat: [describe what you built]"
git push origin main
# Vercel and Railway watch main branch — auto-deploy on every push


# ═══════════════════════════════════════════════════════════════
# STEP 12 — VERCEL AUTO-DEPLOY (set and forget)
# ═══════════════════════════════════════════════════════════════

# In Vercel dashboard for each project:
# Settings → Git → Production Branch: main
# Settings → Git → Preview Branches: enabled
#
# Every push to main → auto-deploys to production
# Every pull request → auto-deploys to preview URL
#
# This means: git push = deployed. Always.


# ═══════════════════════════════════════════════════════════════
# QUICK REFERENCE
# ═══════════════════════════════════════════════════════════════

# Local development:   pnpm dev
# Push & deploy:       git add . && git commit -m "..." && git push
# AI-assisted coding:  claude (from project root)
# Vercel logs:         vercel logs
# Railway logs:        railway logs
# New env variable:    vercel env add VAR_NAME  (or railway variables set)
# Check deployments:   vercel ls  /  railway status
