-- Rollback: 003_create_meta_catalog.down.sql
DROP TABLE IF EXISTS jumpshot_recipes CASCADE;
DROP TABLE IF EXISTS jumpshot_components CASCADE;
DROP TABLE IF EXISTS animations CASCADE;
DROP TABLE IF EXISTS badge_requirements CASCADE;
