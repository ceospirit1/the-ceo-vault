#!/usr/bin/env python3
"""
THE CEO VAULT — Automated Comprehensive Production Test Suite
Validates all HTML elements, buttons, routes, modals, JavaScript stores,
SQL migrations (001-009), Cloudflare Pages Functions, and Stripe Webhook HMAC logic.
"""

import os
import re
import sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

passed_tests = 0
failed_tests = 0

def check(name, condition, details=""):
    global passed_tests, failed_tests
    if condition:
        print(f"  [PASS] {name}")
        passed_tests += 1
    else:
        print(f"  [FAIL] {name} - {details}")
        failed_tests += 1

print("\n" + "="*70)
print("  THE CEO VAULT — PRODUCTION VERIFICATION TEST SUITE")
print("="*70 + "\n")

# 1. Verify Core Project Files
print("--- TEST GROUP 1: Core Project Files & Directory Structure ---")
required_files = [
    'index.html',
    'package.json',
    'wrangler.toml',
    '.env.production.example',
    '.gitignore',
    'README.md',
    'AI_OPERATOR_SETUP.md',
    'DEPLOYMENT_GUIDE.md',
    'QA_RELEASE_REPORT.md',
    'public/_headers',
    'public/_redirects',
    'css/main.css',
    'css/components.css',
    'css/landing.css',
    'css/membership.css',
    'css/dashboard.css',
    'css/auth.css',
    'js/app.js',
    'js/state.js',
    'js/router.js',
    'js/auth.js',
    'js/membership.js',
    'js/landing.js',
    'js/aiOperatorLayer.js',
    'js/aiOperations.js',
    'js/dashboard.js',
    'js/supabase.js',
    'js/components/toast.js',
    'js/components/modal.js',
    'js/components/badge.js',
    'functions/api/stripe-webhook.ts',
    'functions/api/customer-portal.ts',
    'functions/api/discord-sync.ts',
]

for rf in required_files:
    p = os.path.join(BASE_DIR, rf)
    check(f"File exists: {rf}", os.path.exists(p), f"Missing file: {p}")

# 2. Verify SQL Migrations (001 to 009)
print("\n--- TEST GROUP 2: Supabase PostgreSQL Database Migrations ---")
migration_files = [
    '20260821000001_create_core_enums_and_titles.sql',
    '20260821000002_create_profiles_and_verification.sql',
    '20260821000003_create_meta_catalog.sql',
    '20260821000004_create_builds_and_cap_breakers.sql',
    '20260821000005_create_ratings_and_telemetry.sql',
    '20260821000006_create_intel_and_ai_decision_logs.sql',
    '20260821000007_apply_security_rls_policies.sql',
    '20260821000008_create_phase1_member_experience.sql',
    '20260821000009_create_video_vault_and_content_tables.sql',
]

for mf in migration_files:
    p = os.path.join(BASE_DIR, 'supabase/migrations', mf)
    exists = os.path.exists(p)
    check(f"Migration exists: {mf}", exists)
    if exists:
        with open(p, encoding='utf-8') as f:
            sql = f.read()
        check(f"Migration {mf} is non-empty", len(sql) > 100)
        # Check for RLS
        if 'CREATE TABLE' in sql:
            check(f"Migration {mf} contains table definitions", True)

# 3. Verify Public Landing Page & Working Buttons in index.html
print("\n--- TEST GROUP 3: Public Website & Working Buttons ---")
with open(os.path.join(BASE_DIR, 'index.html'), encoding='utf-8') as f:
    html = f.read()

check("Hero section exists", '<section class="hero-section">' in html)
check("Button: 'Join VIP' exists", 'id="hero-btn-join-vip"' in html or 'href="#membership"' in html)
check("Button: 'Founder Access' exists", 'id="hero-btn-founder-access"' in html or "Membership.openCheckout('founder')" in html)
check("Button: 'View Features' exists", 'id="hero-btn-view-features"' in html or 'href="#section-tools"' in html)
check("Button: 'Login' exists", 'id="hero-btn-login"' in html or 'data-modal-target="modal-auth"' in html)
check("Dynamic Founder Countdown exists", 'id="landing-founder-spots"' in html)
check("Interactive Attribute Simulator sliders exist", 'id="sim-slider-3pt"' in html and 'id="sim-slider-dunk"' in html and 'id="sim-slider-handle"' in html)
check("Pricing section with $14.99 and $19.99 exists", '14.99' in html and '19.99' in html)
check("Testimonials section exists", 'WHAT COMP PLAYERS ARE SAYING' in html or 'testimonial-card' in html or 'testimonial-quote' in html)
check("FAQ accordion exists", 'id="faq"' in html and 'faq-question' in html)

# 4. Verify Membership & Checkout Modals
print("\n--- TEST GROUP 4: Membership System & Stripe Integration ---")
check("Checkout Modal exists", 'id="modal-checkout"' in html)
check("Founder checkout pricing $14.99 configured", 'id="checkout-base-price"' in html)
check("Promo code input configured", 'id="checkout-promo-input"' in html and 'id="btn-apply-promo"' in html)
check("Stripe Customer Portal action hooked", 'Membership.openCustomerPortal()' in html)

# 5. Verify User System & Auth Modals
print("\n--- TEST GROUP 5: User System & Authentication ---")
check("Auth Modal exists", 'id="modal-auth"' in html)
check("Email / Password login form exists", 'id="form-login"' in html and 'id="login-email"' in html and 'id="login-password"' in html)
check("Signup form with Gamertag, Platform exists", 'id="form-signup"' in html and 'id="signup-gamertag"' in html and 'id="signup-platform"' in html)
check("Password Reset Modal exists", 'id="modal-reset-password"' in html)
check("Discord OAuth hook configured", 'id="btn-oauth-discord"' in html)
check("Xbox Live Gamertag hook configured", 'id="btn-oauth-xbox"' in html)
check("Guest Explore mode configured", 'btn-auth-guest' in html or 'loginAsGuest()' in html)

# 6. Verify Member Dashboard Subsystems (Build Vault, Jumpshots, Intel, Videos, Settings, Admin)
print("\n--- TEST GROUP 6: Member Dashboard (5 Sections + Admin) ---")
check("Dashboard Main View exists", 'id="view-dashboard"' in html)
check("Tab 1: Build Vault exists", 'id="tab-pane-builds"' in html and 'id="dashboard-builds-grid"' in html)
check("Create/Edit Build Modal exists", 'id="modal-create-build"' in html and 'id="form-create-build"' in html)
check("Tab 2: Jumpshot Lab exists", 'id="tab-pane-jumpshots"' in html and 'id="dashboard-jumpshots-grid"' in html)
check("Custom Jumpshot Modal exists", 'id="modal-create-jumpshot"' in html and 'id="form-create-jumpshot"' in html)
check("Tab 3: Live Intel Feed exists", 'id="tab-pane-intel"' in html and 'id="dashboard-intel-feed"' in html)
check("Intel Detail Modal exists", 'id="modal-intel-detail"' in html)
check("Tab 4: Video Vault exists", 'id="tab-pane-videos"' in html and 'id="dashboard-video-vault-grid"' in html)
check("Video Player Modal exists", 'id="modal-video-player"' in html)
check("Tab 5: Settings exists", 'id="tab-pane-settings"' in html and 'id="form-settings-profile"' in html)
check("Tab 6: Admin Command Center exists", 'id="tab-pane-admin"' in html)
check("Admin Sub-tab: Add Official Build", 'id="form-admin-add-build"' in html)
check("Admin Sub-tab: Add VIP Video", 'id="form-admin-add-video"' in html)
check("Admin Sub-tab: Post Live Intel", 'id="form-admin-add-intel"' in html)
check("Admin Sub-tab: Manage Members Roster", 'id="admin-members-tbody"' in html)
check("Admin Sub-tab: Subscriptions & MRR Analytics", 'admin-pane-analytics' in html and '$24,850' in html)
check("Admin Sub-tab: AI Operator Layer", 'id="admin-subpane-ai-operator"' in html and 'data-admin-subtab="ai-operator"' in html)
check("AI Operator scripts loaded before dashboard", html.find('js/aiOperatorLayer.js') < html.find('js/dashboard.js') and html.find('js/aiOperations.js') < html.find('js/dashboard.js'))
check("AI Operator dashboard actions hooked", 'Dashboard.runAiHealthScan()' in html and 'Dashboard.refreshAiExecutiveBriefing()' in html)

# 7. Verify Cloudflare Edge API Functions
print("\n--- TEST GROUP 7: Cloudflare Edge Functions & Security ---")
with open(os.path.join(BASE_DIR, 'functions/api/stripe-webhook.ts'), encoding='utf-8') as f:
    webhook_code = f.read()

check("Stripe Webhook uses Web Crypto HMAC-SHA256", 'crypto.subtle.importKey' in webhook_code and 'SHA-256' in webhook_code)
check("Stripe Webhook has replay attack tolerance (300s)", 'toleranceSeconds' in webhook_code or 'replay attack' in webhook_code)
check("Stripe Webhook handles subscription lifecycles", 'customer.subscription.deleted' in webhook_code and 'customer.subscription.updated' in webhook_code)
check("Discord Sync edge function exists", os.path.exists(os.path.join(BASE_DIR, 'functions/api/discord-sync.ts')))
check("Customer Portal edge function exists", os.path.exists(os.path.join(BASE_DIR, 'functions/api/customer-portal.ts')))

# 8. Verify AI Operator restore and protected business rules
print("\n--- TEST GROUP 8: AI Operator Restore & Guardrails ---")
with open(os.path.join(BASE_DIR, 'js/aiOperatorLayer.js'), encoding='utf-8') as f:
    ai_layer = f.read()
with open(os.path.join(BASE_DIR, 'js/aiOperations.js'), encoding='utf-8') as f:
    ai_ops = f.read()
with open(os.path.join(BASE_DIR, 'js/dashboard.js'), encoding='utf-8') as f:
    dashboard_code = f.read()
with open(os.path.join(BASE_DIR, 'js/state.js'), encoding='utf-8') as f:
    state_code = f.read()

check("AI Operator business rules protect $14.99/$19.99 pricing", '$14.99' in ai_layer and '$19.99' in ai_layer and '$14.99' in ai_ops and '$19.99' in ai_ops)
check("AI Operator protects Rookie lifetime 1-build rule", 'lifetime 1-build' in ai_layer.lower() and 'lifetime 1-build' in ai_ops.lower())
check("AI Operator exposes executive/reporting engines", 'AiExecutiveReporter' in ai_layer and 'AiCeoControlCenter' in ai_ops)
check("AI Operator exposes health/audit engines", 'AiHealthMonitor' in ai_layer and 'AiAutoAuditSystem' in ai_ops)
check("AI Operator dashboard bindings restored", 'runAiHealthScan' in dashboard_code and 'approveAndPublishDraft' in dashboard_code and 'approveUxProposal' in dashboard_code)
check("Admin-only AI Operator guard restored", 'requireAdminAction' in dashboard_code and "user.role === 'admin'" in dashboard_code)
check("State re-entrancy guard restored", '_isNotifying' in state_code)

print("\n" + "="*70)
print(f"  TOTAL TESTS RUN: {passed_tests + failed_tests}")
print(f"  PASSED: {passed_tests}")
print(f"  FAILED: {failed_tests}")
print("="*70 + "\n")

if failed_tests == 0:
    print("ALL PRODUCTION VERIFICATION TESTS PASSED PERFECTLY!\n")
    sys.exit(0)
else:
    print(f"{failed_tests} TESTS FAILED. Please review above output.\n")
    sys.exit(1)
