-- Paladin core schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users are operators of the Paladin console
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('admin', 'operator', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Agent runs represent supervisor-initiated tasks
CREATE TABLE agent_runs (
    run_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_name VARCHAR(120) NOT NULL,
    objective TEXT,
    status VARCHAR(24) NOT NULL CHECK (status IN ('queued', 'running', 'paused', 'completed', 'failed')) DEFAULT 'queued',
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

-- Suggestions surfaced to the supervisor (mirrors UI)
CREATE TABLE suggestions (
    suggestion_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    detail TEXT NOT NULL,
    severity VARCHAR(16) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',
    status VARCHAR(16) NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Activity log powering the timeline stream
CREATE TABLE activity_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scope VARCHAR(64) NOT NULL,
    message TEXT NOT NULL,
    level VARCHAR(16) NOT NULL CHECK (level IN ('info', 'success', 'warning', 'critical')) DEFAULT 'info',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_suggestions_status ON suggestions(status);
CREATE INDEX idx_activity_logs_level ON activity_logs(level);

