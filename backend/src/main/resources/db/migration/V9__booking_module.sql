-- ============================================================
-- V9 - Create booking_module tables (bookings, booking_seats, seat_locks)
-- ============================================================

-- Table: bookings
CREATE TABLE bookings (
    id           BIGSERIAL      PRIMARY KEY,
    tenant_id    BIGINT         NOT NULL REFERENCES tenant(id),
    user_id      BIGINT         NOT NULL REFERENCES users(id),
    showtime_id  BIGINT         NOT NULL REFERENCES showtimes(id),
    total_amount NUMERIC(10,2)  NOT NULL,
    status       VARCHAR(50)    NOT NULL DEFAULT 'PENDING',
    created_at   TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_user ON bookings (user_id);
CREATE INDEX idx_bookings_showtime ON bookings (showtime_id);
CREATE INDEX idx_bookings_status ON bookings (status);

-- Table: booking_seats (junction for booked seats per showtime)
CREATE TABLE booking_seats (
    id          BIGSERIAL     PRIMARY KEY,
    booking_id  BIGINT        NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    seat_id     BIGINT        NOT NULL REFERENCES seats(id),
    showtime_id BIGINT        NOT NULL REFERENCES showtimes(id),
    price       NUMERIC(10,2) NOT NULL,
    created_at  TIMESTAMP     NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_booking_seats_showtime_seat UNIQUE (showtime_id, seat_id)
);

CREATE INDEX idx_booking_seats_booking ON booking_seats (booking_id);
CREATE INDEX idx_booking_seats_showtime_seat ON booking_seats (showtime_id, seat_id);

-- Table: seat_locks (audit log of acquired locks)
CREATE TABLE seat_locks (
    id          BIGSERIAL PRIMARY KEY,
    showtime_id BIGINT    NOT NULL REFERENCES showtimes(id),
    seat_id     BIGINT    NOT NULL REFERENCES seats(id),
    user_id     BIGINT    NOT NULL REFERENCES users(id),
    locked_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at  TIMESTAMP NOT NULL,
    status      VARCHAR(50) NOT NULL DEFAULT 'LOCKED'
);

CREATE INDEX idx_seat_locks_showtime_seat ON seat_locks (showtime_id, seat_id);
