-- Rollback: 004_create_builds_and_cap_breakers.down.sql
DROP TABLE IF EXISTS cap_breaker_matrix CASCADE;
DROP TABLE IF EXISTS user_favorite_jumpshots CASCADE;
DROP TABLE IF EXISTS user_saved_builds CASCADE;
DROP TABLE IF EXISTS builds CASCADE;
