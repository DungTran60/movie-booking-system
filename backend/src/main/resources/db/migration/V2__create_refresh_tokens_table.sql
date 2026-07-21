-- ============================================================
-- V2 - Create refresh_tokens table
-- ============================================================

CREATE TABLE refresh_tokens (
    id              BIGSERIAL    PRIMARY KEY,
    user_id         BIGINT       NOT NULL,
    token_hash      VARCHAR(255) NOT NULL,
    token_family_id VARCHAR(36)  NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
    expires_at      TIMESTAMP    NOT NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_refresh_token_hash    UNIQUE (token_hash),
    CONSTRAINT fk_refresh_token_user    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);
