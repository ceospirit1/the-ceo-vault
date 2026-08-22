-- Rollback: 001_create_core_enums_and_titles.down.sql
DROP TABLE IF EXISTS game_titles CASCADE;
DROP TYPE IF EXISTS verification_status;
DROP TYPE IF EXISTS player_position;
DROP TYPE IF EXISTS visual_cue_type;
DROP TYPE IF EXISTS jumpshot_component_type;
DROP TYPE IF EXISTS animation_category;
DROP TYPE IF EXISTS badge_category;
DROP TYPE IF EXISTS badge_tier;
DROP TYPE IF EXISTS verification_tier;
DROP TYPE IF EXISTS membership_tier;
DROP TYPE IF EXISTS user_role;
