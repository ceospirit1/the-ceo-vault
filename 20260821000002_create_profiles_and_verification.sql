-- Migration: 002_create_profiles_and_verification.sql
-- Description: User accounts, profiles, VIP subscription state, and creator verification

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY, -- References auth.users.id
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'user',
    membership_tier membership_tier NOT NULL DEFAULT 'free',
    verification_tier verification_tier NOT NULL DEFAULT 'community_member',
    discord_id VARCHAR(50),
    discord_username VARCHAR(100),
    stripe_customer_id VARCHAR(100),
    subscription_status VARCHAR(30) DEFAULT 'inactive',
    current_period_end TIMESTAMPTZ,
    is_anonymized BOOLEAN DEFAULT false,
    is_banned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_membership_tier ON profiles(membership_tier);
CREATE INDEX idx_profiles_verification_tier ON profiles(verification_tier);

-- Creator & Tester Verification Proofs
CREATE TABLE IF NOT EXISTS creator_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    verification_tier verification_tier NOT NULL,
    display_title VARCHAR(100) NOT NULL, -- e.g., '2K League Pro', 'Lab Data Analyst'
    channel_url TEXT,
    proof_notes TEXT,
    verified_by UUID REFERENCES profiles(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_creator_verifications_user ON creator_verifications(user_id);
