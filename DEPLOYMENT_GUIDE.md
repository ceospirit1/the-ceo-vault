# THE CEO VAULT — Production Deployment & Configuration Guide

This guide provides end-to-end instructions for deploying THE CEO VAULT to Cloudflare Pages, configuring the Supabase PostgreSQL database with Row Level Security, setting up Stripe subscriptions and webhooks, and syncing Discord member roles.

---

## 1. Prerequisites
- A [GitHub](https://github.com) account.
- A [Cloudflare](https://cloudflare.com) account with Pages & Workers enabled.
- A [Supabase](https://supabase.com) account and project.
- A [Stripe](https://stripe.com) account (in Test or Live mode).
- A [Discord](https://discord.com) Server and Bot application with `Manage Roles` permission.

---

## 2. Supabase Database Configuration
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Execute the migrations located in `supabase/migrations/` in numerical order:
   - `20260821000001_create_core_enums_and_titles.sql`
   - `20260821000002_create_profiles_and_verification.sql`
   - `20260821000003_create_meta_catalog.sql`
   - `20260821000004_create_builds_and_cap_breakers.sql`
   - `20260821000005_create_ratings_and_telemetry.sql`
   - `20260821000006_create_intel_and_ai_decision_logs.sql`
   - `20260821000007_apply_security_rls_policies.sql`
   - `20260821000008_create_phase1_member_experience.sql`
   - `20260821000009_create_video_vault_and_content_tables.sql`
3. Verify that Row Level Security (RLS) is enabled on all tables in **Database -> Tables**.
4. Retrieve your API credentials from **Settings -> API**:
   - `Project URL`
   - `anon / public key`
   - `service_role key` (Keep private!)

---

## 3. Stripe Subscriptions & Webhook Setup
1. Create two Recurring Monthly Products in the Stripe Dashboard:
   - **Founder VIP Pass**: `$14.99 / month`
   - **Standard VIP Membership**: `$19.99 / month`
2. Configure your Stripe Customer Portal settings (**Settings -> Customer Portal**):
   - Enable subscription cancellations, payment method updates, and invoice viewing.
3. Configure the Webhook Endpoint (**Developers -> Webhooks**):
   - Endpoint URL: `https://your-domain.com/api/stripe-webhook`
   - Select events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Reveal and copy the **Signing Secret** (`whsec_...`).

---

## 4. Discord Bot & Role Configuration
1. In the Discord Developer Portal, create a Bot application with `bot` and `applications.commands` scopes.
2. In your Discord Server, create two VIP roles:
   - `Vault Founder VIP` (with custom gold color and icon)
   - `Vault VIP Member` (with purple color)
3. Ensure the bot's role is positioned higher than the VIP roles in **Server Settings -> Roles**.
4. Copy your `DISCORD_BOT_TOKEN` and `DISCORD_GUILD_ID`.

---

## 5. Cloudflare Pages Deployment
1. Log in to the Cloudflare Dashboard -> **Workers & Pages** -> **Create application** -> **Pages**.
2. Connect your GitHub repository `the-ceo-vault`.
3. Build Settings:
   - Framework preset: `None`
   - Build output directory: `.` (Root directory)
4. Add Environment Variables in Cloudflare Pages (**Settings -> Environment Variables**):
   - `VITE_SUPABASE_URL`: `https://[your-project-ref].supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOi...`
   - `VITE_DEFAULT_GAME_VERSION`: `2K27`
   - `VITE_APP_ENV`: `production`
5. Add Encrypted Secrets via Cloudflare Dashboard or Wrangler CLI:
   ```bash
   wrangler pages secret put SUPABASE_SERVICE_ROLE_KEY
   wrangler pages secret put STRIPE_SECRET_KEY
   wrangler pages secret put STRIPE_WEBHOOK_SECRET
   wrangler pages secret put DISCORD_BOT_TOKEN
   wrangler pages secret put DISCORD_GUILD_ID
   wrangler pages secret put INTERNAL_API_SECRET
   ```
6. Click **Deploy**. Your custom domain (e.g. `theceovault.com`) can be attached under **Custom domains**.

---

## 6. Verification Checklist
- [x] Landing page loads with zero console errors.
- [x] Founder 100 countdown increments and reflects database state.
- [x] Interactive MyPLAYER Simulator sliders trigger dynamic badge unlocks.
- [x] User signup, login, and password reset flows operate without error.
- [x] Stripe Checkout initializes with correct $14.99/$19.99 pricing.
- [x] Dashboard Build Vault supports create, edit, delete, and share operations.
- [x] Jumpshot Lab filters by height, rating, visual cue, and copies formula.
- [x] Live Intel feed filters by category and displays detailed reports.
- [x] Video Vault plays masterclasses and tracks watch progress.
- [x] Settings saves gamertags, platform consoles, and links Discord.
- [x] Admin Command Center enables build creation, video uploads, intel posting, and member management.
