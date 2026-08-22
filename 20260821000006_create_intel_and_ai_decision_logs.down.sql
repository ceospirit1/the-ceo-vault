-- Rollback: 006_create_intel_and_ai_decision_logs.down.sql
DROP TABLE IF EXISTS ai_decision_logs CASCADE;
DROP TABLE IF EXISTS meta_snapshots CASCADE;
DROP TABLE IF EXISTS intel_reports CASCADE;
