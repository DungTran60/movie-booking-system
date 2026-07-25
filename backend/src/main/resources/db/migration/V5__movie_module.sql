-- ============================================================
-- V5 - Create movie_module tables (movies, genres, movie_genres, cinemas, rooms, seats)
-- ============================================================

-- Table: genres
CREATE TABLE genres (
    id   BIGSERIAL    PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    CONSTRAINT uq_genres_name UNIQUE (name),
    CONSTRAINT uq_genres_slug UNIQUE (slug)
);

-- Table: movies
CREATE TABLE movies (
    id           BIGSERIAL    PRIMARY KEY,
    tenant_id    BIGINT       NOT NULL,
    title        VARCHAR(255) NOT NULL,
    slug         VARCHAR(255) NOT NULL,
    description  TEXT,
    duration     INT          NOT NULL, -- in minutes
    language     VARCHAR(50),
    release_date DATE,
    trailer_url  VARCHAR(500),
    rating       VARCHAR(20),
    poster_url   VARCHAR(500),
    status       VARCHAR(50)  NOT NULL DEFAULT 'NOW_SHOWING',
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_movies_slug UNIQUE (slug),
    CONSTRAINT fk_movies_tenant FOREIGN KEY (tenant_id) REFERENCES tenant (id)
);

CREATE INDEX idx_movies_title ON movies (title);
CREATE INDEX idx_movies_status ON movies (status);

-- Table: movie_genres (N-N relationship)
CREATE TABLE movie_genres (
    movie_id BIGINT NOT NULL,
    genre_id BIGINT NOT NULL,
    CONSTRAINT pk_movie_genres PRIMARY KEY (movie_id, genre_id),
    CONSTRAINT fk_movie_genres_movie FOREIGN KEY (movie_id) REFERENCES movies (id) ON DELETE CASCADE,
    CONSTRAINT fk_movie_genres_genre FOREIGN KEY (genre_id) REFERENCES genres (id) ON DELETE CASCADE
);

-- Table: cinemas
CREATE TABLE cinemas (
    id        BIGSERIAL    PRIMARY KEY,
    tenant_id BIGINT       NOT NULL,
    name      VARCHAR(255) NOT NULL,
    address   VARCHAR(500),
    city      VARCHAR(100),
    status    VARCHAR(50)  NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT fk_cinemas_tenant FOREIGN KEY (tenant_id) REFERENCES tenant (id)
);

-- Table: rooms (1-N of cinema)
CREATE TABLE rooms (
    id          BIGSERIAL    PRIMARY KEY,
    cinema_id   BIGINT       NOT NULL,
    name        VARCHAR(100) NOT NULL,
    total_seats INT          NOT NULL DEFAULT 0,
    CONSTRAINT uq_rooms_cinema_name UNIQUE (cinema_id, name),
    CONSTRAINT fk_rooms_cinema FOREIGN KEY (cinema_id) REFERENCES cinemas (id) ON DELETE CASCADE
);

-- Table: seats (1-N of room)
CREATE TABLE seats (
    id          BIGSERIAL   PRIMARY KEY,
    room_id     BIGINT      NOT NULL,
    row_code    VARCHAR(10) NOT NULL,
    seat_number INT         NOT NULL,
    seat_type   VARCHAR(50) NOT NULL DEFAULT 'STANDARD',
    status      VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT uq_seats_room_position UNIQUE (room_id, row_code, seat_number),
    CONSTRAINT fk_seats_room FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE
);
