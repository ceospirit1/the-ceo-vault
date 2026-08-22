-- Migration: 003_create_meta_catalog.sql
-- Description: Badges, animations, jumpshot components, and curated recipes

-- Badge Requirements Table
CREATE TABLE IF NOT EXISTS badge_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_version VARCHAR(10) NOT NULL REFERENCES game_titles(id) ON DELETE RESTRICT,
    badge_name VARCHAR(100) NOT NULL,
    category badge_category NOT NULL,
    tier badge_tier NOT NULL,
    required_attributes JSONB NOT NULL, -- e.g., {"three_point": 89, "stamina": 85}
    required_physicals JSONB DEFAULT '{}'::jsonb, -- e.g., {"strength": 75}
    height_min_inches SMALLINT,
    height_max_inches SMALLINT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    deprecated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(game_version, badge_name, tier)
);

CREATE INDEX idx_badge_requirements_version_cat ON badge_requirements(game_version, category);
CREATE INDEX idx_badge_requirements_name ON badge_requirements(badge_name);

-- Animations Table
CREATE TABLE IF NOT EXISTS animations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_version VARCHAR(10) NOT NULL REFERENCES game_titles(id) ON DELETE RESTRICT,
    category animation_category NOT NULL,
    name VARCHAR(100) NOT NULL,
    tier_grade VARCHAR(5) NOT NULL DEFAULT 'A', -- 'S', 'A', 'B', 'C'
    required_attributes JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g., {"ball_handle": 85}
    required_physicals JSONB NOT NULL DEFAULT '{}'::jsonb,  -- e.g., {"height_max": 78, "vertical": 75}
    meta_notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(game_version, category, name)
);

CREATE INDEX idx_animations_version_category ON animations(game_version, category);

-- Jumpshot Components (Bases & Releases)
CREATE TABLE IF NOT EXISTS jumpshot_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_version VARCHAR(10) NOT NULL REFERENCES game_titles(id) ON DELETE RESTRICT,
    component_type jumpshot_component_type NOT NULL,
    name VARCHAR(100) NOT NULL,
    min_height_inches SMALLINT NOT NULL DEFAULT 0,
    max_height_inches SMALLINT NOT NULL DEFAULT 99,
    min_mid_range SMALLINT NOT NULL DEFAULT 0,
    min_three_point SMALLINT NOT NULL DEFAULT 0,
    release_speed_grade VARCHAR(5) NOT NULL DEFAULT 'B',
    release_height_grade VARCHAR(5) NOT NULL DEFAULT 'B',
    defensive_immunity_grade VARCHAR(5) NOT NULL DEFAULT 'B',
    timing_stability_grade VARCHAR(5) NOT NULL DEFAULT 'B',
    meta_rating NUMERIC(3,2) DEFAULT 4.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(game_version, component_type, name)
);

CREATE INDEX idx_jumpshot_components_lookup ON jumpshot_components(game_version, component_type, min_height_inches, max_height_inches);

-- Jumpshot Recipes
CREATE TABLE IF NOT EXISTS jumpshot_recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_version VARCHAR(10) NOT NULL REFERENCES game_titles(id) ON DELETE RESTRICT,
    title VARCHAR(150) NOT NULL,
    base_id UUID NOT NULL REFERENCES jumpshot_components(id) ON DELETE RESTRICT,
    upper_release_1_id UUID NOT NULL REFERENCES jumpshot_components(id) ON DELETE RESTRICT,
    upper_release_2_id UUID NOT NULL REFERENCES jumpshot_components(id) ON DELETE RESTRICT,
    blend_ratio SMALLINT NOT NULL DEFAULT 50 CHECK (blend_ratio BETWEEN 0 AND 100),
    visual_cue visual_cue_type NOT NULL DEFAULT 'push',
    min_height_inches SMALLINT NOT NULL DEFAULT 0,
    max_height_inches SMALLINT NOT NULL DEFAULT 99,
    min_mid_range SMALLINT NOT NULL DEFAULT 0,
    min_three_point SMALLINT NOT NULL DEFAULT 0,
    overall_speed_grade VARCHAR(5) NOT NULL,
    overall_height_grade VARCHAR(5) NOT NULL,
    overall_immunity_grade VARCHAR(5) NOT NULL,
    overall_stability_grade VARCHAR(5) NOT NULL,
    recommended_positions player_position[] DEFAULT '{}',
    verification_status verification_status NOT NULL DEFAULT 'verified',
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_curated_meta BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jumpshot_recipes_version ON jumpshot_recipes(game_version, is_curated_meta);
