-- ============================================================
-- V1 - Create core tables: tenant, users, roles, user_roles
-- ============================================================

-- Table: tenant
CREATE TABLE tenant (
    id     BIGSERIAL    PRIMARY KEY,
    name   VARCHAR(255) NOT NULL,
    code   VARCHAR(100) NOT NULL,
    status VARCHAR(50)  NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT uq_tenant_code UNIQUE (code)
);

CREATE INDEX idx_tenant_code ON tenant (code);

-- Table: users
CREATE TABLE users (
    id          BIGSERIAL    PRIMARY KEY,
    tenant_id   BIGINT       NOT NULL,
    full_name   VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    password    VARCHAR(255) NOT NULL,
    phone       VARCHAR(20),
    status      VARCHAR(50)  NOT NULL DEFAULT 'ACTIVE',
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_users_email  UNIQUE (email),
    CONSTRAINT uq_users_phone  UNIQUE (phone),
    CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenant (id)
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_phone ON users (phone);

-- Table: roles
CREATE TABLE roles (
    id          BIGSERIAL    PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    CONSTRAINT uq_roles_name UNIQUE (name)
);

-- Table: user_roles (junction, composite PK)
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    CONSTRAINT pk_user_roles      PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
);
