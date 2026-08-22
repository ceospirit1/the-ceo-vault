# THE CEO VAULT — Production SaaS Platform

[![Deployment Status](https://img.shields.io/badge/deployment-ready-gold.svg)](https://theceovault.com)
[![Platform](https://img.shields.io/badge/NBA%202K-2K27%20Meta-purple.svg)](https://theceovault.com)
[![Database](https://img.shields.io/badge/Supabase-PostgreSQL%20RLS-green.svg)](https://supabase.com)
[![Edge Network](https://img.shields.io/badge/Cloudflare-Pages%20%26%20Workers-orange.svg)](https://cloudflare.com)
[![Security](https://img.shields.io/badge/Stripe-HMAC--SHA256%20Verified-blue.svg)](https://stripe.com)

> **THE #1 PREMIUM GAMING INTELLIGENCE VAULT FOR COMPETITIVE NBA 2K PLAYERS**  
> Precision mathematical telemetry, 1,720-point budget optimizer, pure green-window jumpshot formulas, live patch hotfix adaptation, and executive VIP community access.

---

## 🏛️ Project Mission & Overview

**THE CEO VAULT** is a full-featured, luxury-grade SaaS membership platform engineered for competitive gamers. Members pay monthly to access proprietary NBA 2K intelligence, builder calculators, green-window timing cues, verified Pro-Am/Stage schemes, and exclusive video masterclasses.

Founded and directed by **Jeremy Jr. (@CHOSENGREATNESS / THE CEO GAMING)**, the platform eliminates guesswork and prevents players from wasting hundreds of dollars in in-game Virtual Currency (VC) on flawed, un-optimized player builds.

---

## ✨ Core Platform Pillars

### 1. ⚡ 1,720 Point Budget & Cap Breaker Optimizer
- Eliminates dead attribute points that fail to cross badge or animation unlock gates.
- Models progression from baseline 85-99 OVR with +1 to +5 Cap Breaker point allocations.
- Real-time calculations for shooting (93/96 3PT), contact dunk floors (87/93), and speed thresholds.

### 2. 🎯 Jumpshot Lab & Green Window Telemetry
- Complete repository of tested bases (Tracy McGrady, Stephen Curry, Kevin Durant, JT Thor, etc.).
- Upper release blending ratios, release speed grades (A+), and timing stability ratings.
- Frame-perfect visual cue triggers across **Push**, **Release**, **Set Point**, and **Jump** visual timing modes.
- Interactive Custom Jumpshot Formula Creator with 1-click clipboard copying.

### 3. 📢 Live Patch & Stealth Hotfix Intel
- Continuous monitoring of official 2K patches, stealth server hotfixes, and badge efficacy shifts.
- Category filters: **Patch Notes**, **Meta Shifts**, **Pro-Am Schemes**, and **Stealth Alerts**.
- Verified tactical breakdowns and scheme counters (e.g. 6-1 Texas Front, 5-2 El Paso Stunt, 46 Bear, 2-3 Zone).

### 4. 🎬 VIP Video Vault Masterclasses
- Categorized 4K Masterclasses: Build Breakdowns, Defensive Schemes, Jumpshot Secrets, and Competitive Meta.
- Built-in video player with duration, detailed notes, and user watch progress tracking.

### 5. 🛡️ Admin Command Center
- Executive moderation suite for verified creators and admins.
- **Add Official Meta Builds** directly to the public catalog.
- **Upload VIP Video Masterclasses** with tags and durations.
- **Post Live Patch Intel** with severity badges and analysis.
- **Member Management**: Searchable roster, tier management, founder number allocation, and account suspension controls.
- **Subscriptions & MRR Analytics**: Real-time revenue tracking, active founder spot monitoring, and conversion rates.
- **AI Operator Layer v1.0**: Admin-only executive briefing, health audit, UX proposal, and draft-review-publish workflow.

---

## 💎 Membership System & Pricing

| Membership Tier | Monthly Rate | Key Privileges | Discord Role |
| :--- | :--- | :--- | :--- |
| **Founder Pass** (First 100 Members Only) | **$14.99 / mo** *(Locked for Life)* | Permanent Founder Badge (#001-#100), Lifetime Rate Lock, Unlimited Cloud Builds, Complete Lab Access | `Vault Founder VIP` |
| **Standard VIP** (Post-100 Cohort) | **$19.99 / mo** | Unlimited Cloud Builds, Complete Lab Access, Live Intel Feed, Video Masterclasses | `Vault VIP Member` |
| **Rookie Free Tier** | **$0 / mo** | 1 Local Saved Build, Public Jumpshots, Public Intel Preview | `Vault Community Member` |

- **Atomic Founder Spot Allocation**: Handled via PostgreSQL RPC `claim_founder_spot` to prevent race conditions across concurrent checkouts.
- **Self-Serve Stripe Customer Portal**: Direct 1-click billing management, payment method updates, and cancellation handling.

---

## 🗄️ Database Architecture (Supabase PostgreSQL)

Strict Row Level Security (RLS) is enforced across all tables with role-based policies (`auth.uid() = user_id` and `auth.is_admin()`).

### Migrations Inventory:
1. `20260821000001_create_core_enums_and_titles.sql`: User roles, badge tiers, animation categories, positions, and game titles.
2. `20260821000002_create_profiles_and_verification.sql`: User profiles, gamertags, and creator verification logs.
3. `20260821000003_create_meta_catalog.sql`: Badge requirements, animations, and jumpshot components.
4. `20260821000004_create_builds_and_cap_breakers.sql`: Saved builds, custom jumpers, and cap breaker matrices.
5. `20260821000005_create_ratings_and_telemetry.sql`: Community ratings, search telemetry, and feature usage.
6. `20260821000006_create_intel_and_ai_decision_logs.sql`: Live intel reports, meta snapshots, and AI doctor decision logs.
7. `20260821000007_apply_security_rls_policies.sql`: Row-Level Security policies and `auth.is_admin()` helper.
8. `20260821000008_create_phase1_member_experience.sql`: `member_entitlements`, `founder_allocations`, `member_gamer_profiles`, and atomic RPC `claim_founder_spot()`.
9. `20260821000009_create_video_vault_and_content_tables.sql`: `video_vault` masterclasses and `user_video_progress` tracking.

---

## 🚀 Serverless Edge API (Cloudflare Pages Functions)

Located in `/functions/api/`:
- **`/api/stripe-webhook`**: Webhook endpoint with Web Crypto HMAC-SHA256 signature verification and 300s replay attack guard. Processes `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, and `customer.subscription.deleted`.
- **`/api/customer-portal`**: Generates authenticated Stripe Customer Portal sessions for billing self-management.
- **`/api/discord-sync`**: Handles server-to-server Discord role sync to assign `Vault Founder VIP` or `Vault VIP Member` roles upon checkout.

---

## 🛠️ Tech Stack & Directory Structure

```
ceo-vault/
├── index.html                   # High-converting Landing + Membership + Dashboard SPA
├── package.json                 # Project configuration and dependencies
├── AI_OPERATOR_SETUP.md          # Admin operator setup, security rules, and approval policy
├── wrangler.toml                # Cloudflare Pages deployment configuration
├── .env.production.example      # Production environment variable reference
├── .gitignore                   # Git ignore rules
├── public/
│   ├── _headers                 # Security headers (CSP, HSTS, X-Frame-Options)
│   └── _redirects               # SPA fallback routing rules
├── css/
│   ├── main.css                 # Color palette, variables, typography, reset
│   ├── components.css           # Buttons, cards, modals, toast, navbar, badges
│   ├── landing.css              # Hero, stats, tool grid, testimonials, FAQ
│   ├── membership.css           # Pricing tables, checkout forms, comparison
│   ├── dashboard.css            # User header, tab views, build cards, admin center
│   └── auth.css                 # Auth modals, tabs, inputs, OAuth buttons
├── js/
│   ├── app.js                   # Application bootstrap and global event wiring
│   ├── state.js                 # Centralized reactive StateStore
│   ├── router.js                # Protected route manager (#landing, #membership, #dashboard)
│   ├── auth.js                  # Supabase authentication and session persistence
│   ├── membership.js            # Stripe checkout, pricing logic, promo code engine
│   ├── landing.js               # Interactive sliders, dynamic founder counter, FAQ
│   ├── aiOperatorLayer.js        # AI Operator business rules, reporter, analyst, health monitor
│   ├── aiOperations.js           # AI operations, knowledge vault, audit, draft safety systems
│   ├── dashboard.js             # Build Vault CRUD, Jumpshot Lab, Intel, Videos, Admin
│   ├── supabase.js              # Supabase API client and RPC helpers
│   └── components/
│       ├── toast.js             # Notification toast alerts
│       ├── modal.js             # Modal open/close backdrop controller
│       └── badge.js             # 2K badge pill renderers
└── supabase/
    └── migrations/              # Complete PostgreSQL SQL migration files (001-009)
```

---

## ⚡ Deployment Instructions

### 1. Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com).
2. Run migrations 001 through 009 in sequential order via the Supabase SQL Editor.
3. Obtain your `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

### 2. Cloudflare Pages Deployment
1. Connect your GitHub repository to Cloudflare Pages.
2. Build Settings:
   - Framework Preset: **None**
   - Build output directory: **/** (or root repository folder)
3. Configure Environment Variables in Cloudflare Pages Dashboard:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key (Secret)
   - `STRIPE_SECRET_KEY`: Stripe Live Secret Key (Secret)
   - `STRIPE_WEBHOOK_SECRET`: Stripe Webhook Signing Secret (Secret)
   - `DISCORD_BOT_TOKEN`: Discord Bot Token (Secret)
   - `DISCORD_GUILD_ID`: Discord Server Guild ID
   - `INTERNAL_API_SECRET`: Secure internal secret for edge verification

---

## 📄 License & Ownership
Copyright © 2026 THE CEO VAULT. All rights reserved. Directed by **Jeremy Jr.**.
