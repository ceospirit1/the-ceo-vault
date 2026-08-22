-- Rollback: 005_create_ratings_and_telemetry.down.sql
DROP TABLE IF EXISTS feature_usage_daily CASCADE;
DROP TABLE IF EXISTS search_telemetry CASCADE;
DROP TABLE IF EXISTS build_ratings CASCADE;
DROP TABLE IF EXISTS jumpshot_ratings CASCADE;
