-- ============================================================
-- V4 - Seed default admin account
-- Password: Admin@123 (BCrypt hashed, cost=10)
-- ============================================================

-- Insert default tenant
INSERT INTO tenant (name, code, status) VALUES
    ('System', 'SYSTEM', 'ACTIVE');

-- Insert default admin user
INSERT INTO users (tenant_id, full_name, email, password, phone, status)
VALUES (
    (SELECT id FROM tenant WHERE code = 'SYSTEM'),
    'System Admin',
    'admin@moviebooking.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
    '0900000000',
    'ACTIVE'
);

-- Assign ADMIN role to the default admin user
INSERT INTO user_roles (user_id, role_id)
VALUES (
    (SELECT id FROM users WHERE email = 'admin@moviebooking.com'),
    (SELECT id FROM roles WHERE name  = 'ADMIN')
);
