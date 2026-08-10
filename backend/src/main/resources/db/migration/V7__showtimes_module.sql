-- ============================================================
-- V7 - Create showtimes table for managing movie screenings
-- ============================================================

CREATE TABLE showtimes (
    id          BIGSERIAL PRIMARY KEY,
    tenant_id   BIGINT NOT NULL REFERENCES tenants(id),
    movie_id    BIGINT NOT NULL REFERENCES movies(id),
    room_id     BIGINT NOT NULL REFERENCES rooms(id),
    start_time  TIMESTAMP NOT NULL,
    end_time    TIMESTAMP NOT NULL,
    price       NUMERIC(10,2) NOT NULL,
    status      VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_showtime_movie ON showtimes (movie_id);
CREATE INDEX idx_showtime_room ON showtimes (room_id);
CREATE INDEX idx_showtime_time ON showtimes (start_time, end_time);
