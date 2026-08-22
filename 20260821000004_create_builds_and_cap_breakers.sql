-- Migration: 004_create_builds_and_cap_breakers.sql
-- Description: Player builds, attribute allocations, cap breaker progression, and favorites

CREATE TABLE IF NOT EXISTS builds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    game_version VARCHAR(10) NOT NULL REFERENCES game_titles(id) ON DELETE RESTRICT,
    title VARCHAR(120) NOT NULL,
    archetype_name VARCHAR(100),
    position player_position NOT NULL,
    height_inches SMALLINT NOT NULL,
    weight_lbs SMALLINT NOT NULL,
    wingspan_inches SMALLINT NOT NULL,
    attributes JSONB NOT NULL, -- Map of all 25+ base attribute ratings
    cap_breaker_allocation JSONB NOT NULL DEFAULT '{}'::jsonb, -- Allocated cap breakers
    projected_badges JSONB NOT NULL DEFAULT '{}'::jsonb, -- Unlocked badge tiers summary
    primary_mode VARCHAR(20) DEFAULT 'rec',
    playstyle_tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    is_curated_meta BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    soft_deleted_at TIMESTAMPTZ,
    views_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_builds_version_pos ON builds(game_version, position);
CREATE INDEX idx_builds_user ON builds(user_id);
CREATE INDEX idx_builds_meta ON builds(game_version, is_curated_meta, is_public);

-- User Saved / Favorited Builds Join Table
CREATE TABLE IF NOT EXISTS user_saved_builds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    build_id UUID NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, build_id)
);

CREATE INDEX idx_user_saved_builds_user ON user_saved_builds(user_id);

-- User Favorite Jumpshots Join Table
CREATE TABLE IF NOT EXISTS user_favorite_jumpshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    jumpshot_id UUID NOT NULL REFERENCES jumpshot_recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, jumpshot_id)
);

CREATE INDEX idx_user_favorite_jumpshots_user ON user_favorite_jumpshots(user_id);

-- Cap Breaker Matrix & Progression Paths
CREATE TABLE IF NOT EXISTS cap_breaker_matrix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_version VARCHAR(10) NOT NULL REFERENCES game_titles(id) ON DELETE RESTRICT,
    attribute_name VARCHAR(50) NOT NULL,
    tier_level SMALLINT NOT NULL, -- 1 to 5
    cost_points SMALLINT NOT NULL DEFAULT 1,
    max_boost SMALLINT NOT NULL DEFAULT 5,
    threshold_boost_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cap_breaker_version ON cap_breaker_matrix(game_version);
