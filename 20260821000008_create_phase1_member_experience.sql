-- Migration: 008_create_phase1_member_experience.sql
-- Description: Additive member entitlements, founder allocations with permanent founder_locked, gamer profiles, vault folders & saved reports

-- 1. Member Entitlements Table (Stripe Subscription Sync)
CREATE TABLE IF NOT EXISTS public.member_entitlements (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    subscription_tier VARCHAR(20) NOT NULL DEFAULT 'free' 
        CHECK (subscription_tier IN ('free', 'founder', 'standard')),
    subscription_status VARCHAR(30) NOT NULL DEFAULT 'inactive'
        CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled', 'inactive')),
    founder_number INTEGER CHECK (founder_number BETWEEN 1 AND 100),
    founder_locked BOOLEAN NOT NULL DEFAULT false, -- Identity permanently locked once founder spot claimed
    stripe_customer_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100) UNIQUE,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_member_entitlements_tier ON public.member_entitlements(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_member_entitlements_status ON public.member_entitlements(subscription_status);

-- 2. Founder Allocations Table (Strict 1-100 Sequential Registry with founder_locked)
CREATE TABLE IF NOT EXISTS public.founder_allocations (
    founder_number INTEGER PRIMARY KEY CHECK (founder_number BETWEEN 1 AND 100),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(100) NOT NULL,
    founder_locked BOOLEAN NOT NULL DEFAULT true, -- Permanent badge identity
    claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'lapsed')),
    lapsed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_founder_allocations_user ON public.founder_allocations(user_id);
CREATE INDEX IF NOT EXISTS idx_founder_allocations_status ON public.founder_allocations(status);

-- 3. Member Gamer Profiles Table (Gamer Tag & Platform Selection)
CREATE TABLE IF NOT EXISTS public.member_gamer_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    platform VARCHAR(20) NOT NULL DEFAULT 'xbox' 
        CHECK (platform IN ('xbox', 'playstation', 'steam')),
    gamer_tag VARCHAR(60) NOT NULL,
    preferred_mode VARCHAR(30) NOT NULL DEFAULT '5v5_pro_am'
        CHECK (preferred_mode IN ('5v5_pro_am', 'rec', '3v3_park', '1v1_stage')),
    primary_position VARCHAR(5) NOT NULL DEFAULT 'PG'
        CHECK (primary_position IN ('PG', 'SG', 'SF', 'PF', 'C')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Vault Folders Table (Locker Organization)
CREATE TABLE IF NOT EXISTS public.vault_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    folder_name VARCHAR(60) NOT NULL,
    folder_icon VARCHAR(30) DEFAULT 'folder',
    color_code VARCHAR(15) DEFAULT '#EAB308',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, folder_name)
);

CREATE INDEX IF NOT EXISTS idx_vault_folders_user ON public.vault_folders(user_id);

-- 5. Saved Audit Reports Table (My Vault v1 Reports)
CREATE TABLE IF NOT EXISTS public.user_saved_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES public.vault_folders(id) ON DELETE SET NULL,
    build_id UUID REFERENCES public.builds(id) ON DELETE SET NULL,
    report_title VARCHAR(150) NOT NULL,
    report_type VARCHAR(40) NOT NULL DEFAULT 'pre_vc_audit',
    health_score SMALLINT NOT NULL DEFAULT 100,
    diagnoses_summary JSONB NOT NULL DEFAULT '[]'::jsonb,
    vc_estimation JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_saved_reports_user ON public.user_saved_reports(user_id);

-- 6. Enable Row Level Security (RLS) on all additive tables
ALTER TABLE public.member_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_gamer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_reports ENABLE ROW LEVEL SECURITY;

-- 7. RLS Security Policies
CREATE POLICY "Users read own entitlement" 
    ON public.member_entitlements FOR SELECT USING (auth.uid() = user_id OR auth.is_admin());
CREATE POLICY "Admin manage entitlements" 
    ON public.member_entitlements FOR ALL USING (auth.is_admin());

CREATE POLICY "Public read founder allocations" 
    ON public.founder_allocations FOR SELECT USING (true);
CREATE POLICY "Admin manage founder allocations" 
    ON public.founder_allocations FOR ALL USING (auth.is_admin());

CREATE POLICY "Public read member gamer profiles" 
    ON public.member_gamer_profiles FOR SELECT USING (true);
CREATE POLICY "Users manage own gamer profile" 
    ON public.member_gamer_profiles FOR ALL USING (auth.uid() = user_id OR auth.is_admin());

CREATE POLICY "Users manage own folders" 
    ON public.vault_folders FOR ALL USING (auth.uid() = user_id OR auth.is_admin());

CREATE POLICY "Users manage own saved reports" 
    ON public.user_saved_reports FOR ALL USING (auth.uid() = user_id OR auth.is_admin());

-- 8. Atomic Stored Procedure: Claim Founder Spot (Race-Condition Proof with founder_locked)
CREATE OR REPLACE FUNCTION public.claim_founder_spot(
    p_user_id UUID, 
    p_sub_id TEXT
) RETURNS JSONB AS $$
DECLARE
    v_next_num INTEGER;
    v_existing RECORD;
BEGIN
    -- Check if user already holds an allocation
    SELECT founder_number, status INTO v_existing 
    FROM public.founder_allocations 
    WHERE user_id = p_user_id;

    IF FOUND THEN
        -- Reactivate if previously lapsed
        IF v_existing.status = 'lapsed' THEN
            UPDATE public.founder_allocations
            SET status = 'active', stripe_subscription_id = p_sub_id, lapsed_at = NULL
            WHERE user_id = p_user_id;
        END IF;

        UPDATE public.member_entitlements
        SET subscription_tier = 'founder',
            subscription_status = 'active',
            founder_number = v_existing.founder_number,
            founder_locked = true,
            stripe_subscription_id = p_sub_id,
            updated_at = NOW()
        WHERE user_id = p_user_id;

        RETURN jsonb_build_object(
            'success', true, 
            'founder_number', v_existing.founder_number, 
            'founder_locked', true,
            'is_reactivation', true
        );
    END IF;

    -- Find lowest available number from 1 to 100
    SELECT MIN(num) INTO v_next_num
    FROM generate_series(1, 100) AS num
    WHERE num NOT IN (SELECT founder_number FROM public.founder_allocations WHERE status = 'active');

    IF v_next_num IS NULL THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'Founder spots are fully claimed (100/100 limit reached)'
        );
    END IF;

    -- Insert into founder allocations
    INSERT INTO public.founder_allocations (founder_number, user_id, stripe_subscription_id, founder_locked, status)
    VALUES (v_next_num, p_user_id, p_sub_id, true, 'active');

    -- Update or Insert into member entitlements
    INSERT INTO public.member_entitlements (
        user_id, subscription_tier, subscription_status, founder_number, founder_locked, stripe_subscription_id, updated_at
    ) VALUES (
        p_user_id, 'founder', 'active', v_next_num, true, p_sub_id, NOW()
    ) ON CONFLICT (user_id) DO UPDATE SET
        subscription_tier = 'founder',
        subscription_status = 'active',
        founder_number = v_next_num,
        founder_locked = true,
        stripe_subscription_id = p_sub_id,
        updated_at = NOW();

    RETURN jsonb_build_object(
        'success', true, 
        'founder_number', v_next_num, 
        'founder_locked', true,
        'is_new_claim', true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Stored Procedure: Get Complete Member Entitlement Status
CREATE OR REPLACE FUNCTION public.get_member_entitlement_status(p_user_id UUID DEFAULT auth.uid())
RETURNS JSONB AS $$
DECLARE
    v_ent public.member_entitlements%ROWTYPE;
    v_gamer public.member_gamer_profiles%ROWTYPE;
    v_is_active BOOLEAN;
    v_badge_label TEXT;
    v_discord_role TEXT;
BEGIN
    SELECT * INTO v_ent FROM public.member_entitlements WHERE user_id = p_user_id;
    SELECT * INTO v_gamer FROM public.member_gamer_profiles WHERE user_id = p_user_id;

    IF NOT FOUND AND v_ent.user_id IS NULL THEN
        RETURN jsonb_build_object(
            'is_authenticated', (p_user_id IS NOT NULL),
            'subscription_tier', 'free',
            'subscription_status', 'inactive',
            'is_active_member', false,
            'founder_number', NULL,
            'founder_locked', false,
            'badge_label', 'COMMUNITY MEMBER',
            'discord_role', 'Vault Community Member',
            'platform', COALESCE(v_gamer.platform, 'xbox'),
            'gamer_tag', v_gamer.gamer_tag,
            'preferred_mode', COALESCE(v_gamer.preferred_mode, '5v5_pro_am')
        );
    END IF;

    v_is_active := (v_ent.subscription_status = 'active' OR v_ent.subscription_status = 'trialing');

    IF v_ent.founder_number IS NOT NULL THEN
        v_badge_label := 'FOUNDER BADGE #' || LPAD(v_ent.founder_number::TEXT, 3, '0');
        v_discord_role := CASE WHEN v_is_active THEN 'Vault Founder VIP' ELSE 'Vault Community Member' END;
    ELSIF v_ent.subscription_tier = 'standard' THEN
        v_badge_label := 'STANDARD VIP MEMBER';
        v_discord_role := CASE WHEN v_is_active THEN 'Vault VIP Member' ELSE 'Vault Community Member' END;
    ELSE
        v_badge_label := 'COMMUNITY MEMBER';
        v_discord_role := 'Vault Community Member';
    END IF;

    RETURN jsonb_build_object(
        'user_id', p_user_id,
        'subscription_tier', v_ent.subscription_tier,
        'subscription_status', v_ent.subscription_status,
        'is_active_member', v_is_active,
        'founder_number', v_ent.founder_number,
        'founder_locked', v_ent.founder_locked,
        'badge_label', v_badge_label,
        'discord_role', v_discord_role,
        'platform', COALESCE(v_gamer.platform, 'xbox'),
        'gamer_tag', v_gamer.gamer_tag,
        'preferred_mode', COALESCE(v_gamer.preferred_mode, '5v5_pro_am'),
        'cancel_at_period_end', v_ent.cancel_at_period_end
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
