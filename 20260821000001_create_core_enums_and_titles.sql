-- Migration: 001_create_core_enums_and_titles.sql
-- Description: Core ENUMs, game title registry, and versioning foundation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core Enums
CREATE TYPE user_role AS ENUM ('user', 'creator', 'analyst', 'admin');
CREATE TYPE membership_tier AS ENUM ('free', 'vip', 'pro');
CREATE TYPE verification_tier AS ENUM ('community_member', 'verified_creator', 'trusted_lab', 'internal_tester');
CREATE TYPE badge_tier AS ENUM ('bronze', 'silver', 'gold', 'hall_of_fame', 'legend');
CREATE TYPE badge_category AS ENUM ('inside_scoring', 'outside_scoring', 'playmaking', 'defense_rebounding');
CREATE TYPE animation_category AS ENUM (
    'dribble_style', 'signature_sizeup', 'escape_move', 'crossover', 
    'behind_the_back', 'spin', 'hesitation', 'stepback', 
    'layup_package', 'dunk_package', 'contact_dunks', 'pass_style', 'defensive_motion'
);
CREATE TYPE jumpshot_component_type AS ENUM ('base', 'upper_release');
CREATE TYPE visual_cue_type AS ENUM ('push', 'release', 'set_point', 'jump');
CREATE TYPE player_position AS ENUM ('PG', 'SG', 'SF', 'PF', 'C');
CREATE TYPE verification_status AS ENUM ('verified', 'community_tested', 'needs_testing', 'unconfirmed');

-- Game Titles & Version Registry Table
CREATE TABLE IF NOT EXISTS game_titles (
    id VARCHAR(10) PRIMARY KEY, -- e.g., '2K26', '2K27', '2K28'
    title_name VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT false,
    is_supported BOOLEAN DEFAULT true,
    current_patch_version VARCHAR(20) NOT NULL DEFAULT '1.00',
    attribute_taxonomy JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed initial game versions
INSERT INTO game_titles (id, title_name, is_active, is_supported, current_patch_version, attribute_taxonomy)
VALUES 
    ('2K26', 'NBA 2K26', false, true, '1.08', '{"categories": ["finishing", "shooting", "playmaking", "defense", "physicals"]}'::jsonb),
    ('2K27', 'NBA 2K27', true, true, '1.00', '{"categories": ["inside_scoring", "outside_scoring", "playmaking", "defense_rebounding", "physicals"]}'::jsonb),
    ('2K28', 'NBA 2K28', false, true, '0.00', '{"categories": ["inside_scoring", "outside_scoring", "playmaking", "defense_rebounding", "physicals"]}'::jsonb)
ON CONFLICT (id) DO NOTHING;
