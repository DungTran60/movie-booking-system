-- ============================================================
-- V10 - Create payments table for booking payment and refund flow
-- ============================================================

CREATE TABLE payments (
    id             BIGSERIAL      PRIMARY KEY,
    booking_id     BIGINT         NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    tenant_id      BIGINT         NOT NULL REFERENCES tenant(id),
    amount         NUMERIC(10,2)  NOT NULL,
    payment_method VARCHAR(50)    NOT NULL DEFAULT 'MOCK',
    transaction_id VARCHAR(100)   NOT NULL,
    status         VARCHAR(50)    NOT NULL DEFAULT 'PENDING',
    created_at     TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_booking ON payments (booking_id);
CREATE INDEX idx_payments_status ON payments (status);
