-- ============================================================
-- V3 - Seed core roles: ADMIN, STAFF, CUSTOMER
-- ============================================================

INSERT INTO roles (name, description) VALUES
    ('ADMIN',    'System administrator with full access'),
    ('STAFF',    'Cinema staff with operational access'),
    ('CUSTOMER', 'Regular customer with booking access');
