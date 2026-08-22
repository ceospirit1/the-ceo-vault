-- Migration: 006_create_intel_and_ai_decision_logs.sql
-- Description: Patch intelligence reports, meta snapshots, and explainable AI decision logs

-- Intel Reports (Patch notes, tuning alerts)
CREATE TABLE IF NOT EXISTS intel_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_version VARCHAR(10) NOT NULL REFERENCES game_titles(id),
    patch_version VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    source_type VARCHAR(30) NOT NULL, -- 'official_2k', 'lab_test', 'creator', 'leak'
    confidence_level verification_status NOT NULL DEFAULT 'verified',
    gameplay_impact_summary TEXT NOT NULL,
    affected_components TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    published_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_intel_reports_version ON intel_reports(game_version, patch_version);

-- Meta Snapshots (7-day trend rankings)
CREATE TABLE IF NOT EXISTS meta_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_version VARCHAR(10) NOT NULL REFERENCES game_titles(id),
    patch_version VARCHAR(20) NOT NULL,
    entity_type VARCHAR(20) NOT NULL, -- 'build', 'jumpshot', 'animation'
    entity_id UUID NOT NULL,
    usage_rank INTEGER NOT NULL,
    performance_score NUMERIC(4,2) DEFAULT 0.00,
    meta_tier VARCHAR(10) NOT NULL, -- 'S', 'A', 'B', 'C'
    rolling_7d_views INTEGER DEFAULT 0,
    rolling_7d_saves INTEGER DEFAULT 0,
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meta_snapshots_lookup ON meta_snapshots(game_version, patch_version, entity_type, meta_tier);

-- AI Decision & Explainability Logs
CREATE TABLE IF NOT EXISTS ai_decision_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    session_id VARCHAR(64),
    game_version VARCHAR(10) NOT NULL REFERENCES game_titles(id),
    module VARCHAR(30) NOT NULL, -- 'build_fixer', 'jumpshot_recommender', 'cap_breaker_optimizer'
    input_parameters JSONB NOT NULL,
    recommended_output JSONB NOT NULL,
    confidence_score NUMERIC(3,2) NOT NULL CHECK (confidence_score BETWEEN 0.00 AND 1.00),
    supporting_evidence JSONB NOT NULL,
    reasoning_summary TEXT NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    verification_passed BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_decision_logs_module ON ai_decision_logs(game_version, module);
CREATE INDEX idx_ai_decision_logs_user ON ai_decision_logs(user_id);
