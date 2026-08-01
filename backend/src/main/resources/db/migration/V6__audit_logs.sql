-- ============================================================
-- V6 - Create audit_logs table for tracking admin modifications
-- ============================================================

CREATE TABLE audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    tenant_id   BIGINT,
    user_id     BIGINT,
    user_email  VARCHAR(255),
    action      VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id   BIGINT,
    details     TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_action ON audit_logs (action);
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_name, entity_id);
