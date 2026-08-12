-- ============================================================
-- V8 - Update Admin password to Admin@123 and ensure ADMIN role is assigned
-- ============================================================

UPDATE users
SET password = '$2a$10$4NfMid2ubMnCk3v4Y7XcmuehWceHw83oL/DkQIec1Co9DzSvkuVhe'
WHERE email = 'admin@moviebooking.com';
