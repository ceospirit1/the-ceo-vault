-- Migration: 007_apply_security_rls_policies.sql
-- Description: Comprehensive Row Level Security (RLS) enforcement across all tables

-- Enable RLS on all tables
ALTER TABLE game_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE animations ENABLE ROW LEVEL SECURITY;
ALTER TABLE jumpshot_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE jumpshot_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorite_jumpshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE cap_breaker_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE jumpshot_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_decision_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if caller is an admin
CREATE OR REPLACE FUNCTION auth.is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check if user has active VIP / Founder access (RPC callable)
CREATE OR REPLACE FUNCTION public.ceo_vault_access_check(user_uuid UUID DEFAULT auth.uid()) 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_uuid 
          AND membership_tier IN ('founder', 'founder_monthly', 'vip', 'pro')
          AND (subscription_status = 'active' OR membership_tier = 'founder')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Get complete launch entitlement details for user (RPC callable)
CREATE OR REPLACE FUNCTION public.get_ceo_vault_launch_access(user_uuid UUID DEFAULT auth.uid())
RETURNS JSONB AS $$
DECLARE
    v_profile public.profiles%ROWTYPE;
    v_is_entitled BOOLEAN;
BEGIN
    SELECT * INTO v_profile FROM public.profiles WHERE id = user_uuid;
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'is_authenticated', false,
            'is_entitled', false,
            'membership_tier', 'free',
            'launch_status', 'no_profile'
        );
    END IF;

    v_is_entitled := (
        v_profile.membership_tier IN ('founder', 'founder_monthly', 'vip', 'pro')
        AND (v_profile.subscription_status = 'active' OR v_profile.membership_tier = 'founder')
    );

    RETURN jsonb_build_object(
        'user_id', v_profile.id,
        'username', v_profile.username,
        'membership_tier', v_profile.membership_tier,
        'is_entitled', v_is_entitled,
        'subscription_status', v_profile.subscription_status,
        'role', v_profile.role,
        'discord_username', v_profile.discord_username,
        'is_founder', (v_profile.membership_tier = 'founder' OR v_profile.membership_tier = 'founder_monthly')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Public Read Catalog Policies
CREATE POLICY "Public read for game titles" ON game_titles FOR SELECT USING (true);
CREATE POLICY "Admin write for game titles" ON game_titles FOR ALL USING (auth.is_admin());

CREATE POLICY "Public read for badge requirements" ON badge_requirements FOR SELECT USING (is_active = true OR auth.is_admin());
CREATE POLICY "Admin write for badge requirements" ON badge_requirements FOR ALL USING (auth.is_admin());

CREATE POLICY "Public read for animations" ON animations FOR SELECT USING (is_active = true OR auth.is_admin());
CREATE POLICY "Admin write for animations" ON animations FOR ALL USING (auth.is_admin());

CREATE POLICY "Public read for jumpshot components" ON jumpshot_components FOR SELECT USING (is_active = true OR auth.is_admin());
CREATE POLICY "Admin write for jumpshot components" ON jumpshot_components FOR ALL USING (auth.is_admin());

CREATE POLICY "Public read for jumpshot recipes" ON jumpshot_recipes FOR SELECT USING (is_active = true OR auth.is_admin());
CREATE POLICY "Creator/Admin write for jumpshot recipes" ON jumpshot_recipes FOR ALL USING (
    auth.uid() = author_id OR auth.is_admin()
);

CREATE POLICY "Public read for cap breaker matrix" ON cap_breaker_matrix FOR SELECT USING (true);
CREATE POLICY "Admin write for cap breaker matrix" ON cap_breaker_matrix FOR ALL USING (auth.is_admin());

CREATE POLICY "Public read for intel reports" ON intel_reports FOR SELECT USING (is_active = true OR auth.is_admin());
CREATE POLICY "Admin write for intel reports" ON intel_reports FOR ALL USING (auth.is_admin());

CREATE POLICY "Public read for meta snapshots" ON meta_snapshots FOR SELECT USING (true);
CREATE POLICY "Admin write for meta snapshots" ON meta_snapshots FOR ALL USING (auth.is_admin());

-- 2. Profiles Policies
CREATE POLICY "Public profile read" ON profiles FOR SELECT USING (true);
CREATE POLICY "User update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin manage profiles" ON profiles FOR ALL USING (auth.is_admin());

-- 3. Builds Policies
CREATE POLICY "Public or owner read builds" ON builds FOR SELECT USING (
    (is_public = true AND is_archived = false) OR auth.uid() = user_id OR auth.is_admin()
);
CREATE POLICY "User create builds" ON builds FOR INSERT WITH CHECK (
    auth.uid() = user_id
);
CREATE POLICY "User update own builds" ON builds FOR UPDATE USING (
    auth.uid() = user_id OR auth.is_admin()
);
CREATE POLICY "User soft delete own builds" ON builds FOR DELETE USING (
    auth.uid() = user_id OR auth.is_admin()
);

-- 4. User Favorites & Saved Items Policies
CREATE POLICY "User manage saved builds" ON user_saved_builds FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "User manage favorite jumpshots" ON user_favorite_jumpshots FOR ALL USING (auth.uid() = user_id);

-- 5. Ratings Policies
CREATE POLICY "Public read jumpshot ratings" ON jumpshot_ratings FOR SELECT USING (true);
CREATE POLICY "User manage own jumpshot ratings" ON jumpshot_ratings FOR ALL USING (auth.uid() = user_id OR auth.is_admin());

CREATE POLICY "Public read build ratings" ON build_ratings FOR SELECT USING (true);
CREATE POLICY "User manage own build ratings" ON build_ratings FOR ALL USING (auth.uid() = user_id OR auth.is_admin());

-- 6. AI Decision Logs & Telemetry Policies
CREATE POLICY "User read own AI decision logs" ON ai_decision_logs FOR SELECT USING (auth.uid() = user_id OR auth.is_admin());
CREATE POLICY "Service/User insert AI decision logs" ON ai_decision_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin read telemetry" ON search_telemetry FOR SELECT USING (auth.is_admin());
CREATE POLICY "Public insert telemetry" ON search_telemetry FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read feature usage daily" ON feature_usage_daily FOR SELECT USING (true);
CREATE POLICY "Admin write feature usage daily" ON feature_usage_daily FOR ALL USING (auth.is_admin());
