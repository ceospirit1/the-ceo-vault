# THE CEO VAULT - AI Operator Setup Guide

This guide explains how to access, configure, and operate the AI Operator Layer v1.0 within THE CEO VAULT.

## System Overview

The AI Operator Layer acts as a 24/7 executive co-pilot. It monitors website health, analyzes growth and UX signals, triages telemetry, drafts patch notes, and suggests conversion optimizations.

Core principle: AI recommends and drafts. Jeremy, The CEO, decides and approves.

No AI recommendation is published, and no critical database, pricing, or permission change is executed without explicit CEO approval.

## Permission & Security Architecture

- Admin-only isolation: the AI Operator dashboard is restricted to authenticated users with `profiles.role = 'admin'`.
- Zero public access: Free Rookie, Standard VIP, and Founder VIP members cannot invoke AI Operator admin functions.
- Anti-privilege escalation: PostgreSQL RLS must prevent users from altering their own `role` or `membership_tier`.
- Payment and data immutability: AI cannot bypass Stripe payments, reduce VIP pricing, delete customer builds, or expose private data.

## Access

1. Log in with the owner/admin account.
2. Navigate to the Member Dashboard.
3. Open the Admin Command Center tab.
4. Open the AI Operator Layer v1.0 subtab.

## Core Capabilities

- Daily Executive Report: system health, founder slots, MRR, stale content warnings, and action items.
- AI Website Analyst: structured UX and conversion proposals with CEO approval actions.
- NBA 2K Intel Operator: drafts patch summaries, hotfix analysis, build and jumpshot recommendations, Discord announcements, and member notifications.
- Change Safety and Rollback Engine: high-risk changes require explicit confirmation and rollback payloads.

## Optional External AI

The AI Operator works deterministically from the Vault rule graph. Future external AI synthesis can be connected with:

```bash
AI_API_KEY=your_gemini_or_cloudflare_ai_key_here
```

If unset, the system uses the deterministic Vault Knowledge Rule Graph.
