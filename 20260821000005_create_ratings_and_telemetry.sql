-- Migration: 005_create_ratings_and_telemetry.sql
-- Description: Jumpshot and build ratings, anti-abuse flags, and search telemetry

-- Jumpshot Community Ratings
CREATE TABLE IF NOT EXISTS jumpshot_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    jumpshot_id UUID NOT NULL REFERENCES jumpshot_recipes(id) ON DELETE CASCADE,
    game_version VARCHAR(10) NOT NULL REFERENCES game_titles(id) ON DELETE RESTRICT,
    green_consistency SMALLINT NOT NULL CHECK (green_consistency BETWEEN 1 AND 5),
    cue_clarity SMALLINT NOT NULL CHECK (cue_clarity BETWEEN 1 AND 5),
    contest_resistance SMALLINT NOT NULL CHECK (contest_resistance BETWEEN 1 AND 5),
    speed_feel SMALLINT NOT NULL CHECK (speed_feel BETWEEN 1 AND 5),
    feedback_text TEXT,
    trust_weight NUMERIC(3,2) NOT NULL DEFAULT 1.00,
    is_flagged_for_review BOOLEAN DEFAULT false,
    is_active_user_jumper BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, jumpshot_id, game_version)
);

CREATE INDEX idx_jumpshot_ratings_item ON jumpshot_ratings(jumpshot_id, game_version);

-- Build Ratings & Reviews
CREATE TABLE IF NOT EXISTS build_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    build_id UUID NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
    game_version VARCHAR(10) NOT NULL REFERENCES game_titles(id) ON DELETE RESTRICT,
    overall_score SMALLINT NOT NULL CHECK (overall_score BETWEEN 1 AND 5),
    primary_mode VARCHAR(20) NOT NULL DEFAULT 'rec',
    perceived_tier VARCHAR(20) NOT NULL DEFAULT 'competitive_a',
    success_bracket VARCHAR(20) DEFAULT '50-65%',
    review_summary TEXT,
    trust_weight NUMERIC(3,2) NOT NULL DEFAULT 1.00,
    is_flagged_for_review BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, build_id, game_version)
);

CREATE INDEX idx_build_ratings_item ON build_ratings(build_id, game_version);

-- Search Query Telemetry Log (Edge-Buffered)
CREATE TABLE IF NOT EXISTS search_telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_version VARCHAR(10) NOT NULL REFERENCES game_titles(id),
    search_module VARCHAR(30) NOT NULL,
    query_filters JSONB NOT NULL,
    results_count INTEGER NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_search_telemetry_module ON search_telemetry(game_version, search_module);

-- Daily Feature Usage Rollups
CREATE TABLE IF NOT EXISTS feature_usage_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_date DATE NOT NULL DEFAULT CURRENT_DATE,
    feature_name VARCHAR(50) NOT NULL,
    total_executions INTEGER NOT NULL DEFAULT 0,
    unique_users INTEGER NOT NULL DEFAULT 0,
    game_version VARCHAR(10) NOT NULL REFERENCES game_titles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_date, feature_name, game_version)
);
