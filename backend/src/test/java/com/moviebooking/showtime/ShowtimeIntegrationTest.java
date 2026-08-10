package com.moviebooking.showtime;

import com.moviebooking.auth.dto.AuthResponse;
import com.moviebooking.auth.dto.LoginRequest;
import com.moviebooking.cinema.dto.request.CreateCinemaRequest;
import com.moviebooking.cinema.dto.request.CreateRoomRequest;
import com.moviebooking.cinema.dto.response.CinemaResponse;
import com.moviebooking.cinema.dto.response.RoomResponse;
import com.moviebooking.common.dto.response.ApiResponse;
import com.moviebooking.movie.dto.request.CreateMovieRequest;
import com.moviebooking.movie.dto.response.MovieDetailResponse;
import com.moviebooking.showtime.dto.CreateShowtimeRequest;
import com.moviebooking.showtime.dto.ShowtimeResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class ShowtimeIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("movie_booking_test_showtime")
            .withUsername("test_user")
            .withPassword("test_password");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
    }

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    @DisplayName("Creating 2 overlapping showtimes in same room must reject second request with 409 Conflict SHOWTIME_OVERLAP (BR-05)")
    void overlappingShowtimeSchedule_rejectedWith409Conflict() {
        // Step 0: Login as Admin
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("admin@moviebooking.com");
        loginReq.setPassword("Admin@123");

        ResponseEntity<ApiResponse<AuthResponse>> loginResp = restTemplate.exchange(
                "/api/v1/auth/login",
                HttpMethod.POST,
                new HttpEntity<>(loginReq),
                new ParameterizedTypeReference<>() {}
        );

        assertEquals(HttpStatus.OK, loginResp.getStatusCode());
        assertNotNull(loginResp.getBody());
        String adminToken = loginResp.getBody().getData().getAccessToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(adminToken);

        // Step 1: Create Movie
        CreateMovieRequest movieReq = new CreateMovieRequest();
        movieReq.setTitle("Oppenheimer Integration");
        movieReq.setDuration(180);
        movieReq.setLanguage("English");
        movieReq.setRating("T18");

        ResponseEntity<ApiResponse<MovieDetailResponse>> movieResp = restTemplate.exchange(
                "/api/v1/admin/movies",
                HttpMethod.POST,
                new HttpEntity<>(movieReq, headers),
                new ParameterizedTypeReference<>() {}
        );
        assertEquals(HttpStatus.OK, movieResp.getStatusCode());
        Long movieId = movieResp.getBody().getData().getId();

        // Step 2: Create Cinema & Room
        CreateCinemaRequest cinemaReq = new CreateCinemaRequest();
        cinemaReq.setName("CineTicket Showcase");
        cinemaReq.setAddress("789 Integration St");
        cinemaReq.setCity("HCMC");

        ResponseEntity<ApiResponse<CinemaResponse>> cinemaResp = restTemplate.exchange(
                "/api/v1/admin/cinemas",
                HttpMethod.POST,
                new HttpEntity<>(cinemaReq, headers),
                new ParameterizedTypeReference<>() {}
        );
        Long cinemaId = cinemaResp.getBody().getData().getId();

        CreateRoomRequest roomReq = new CreateRoomRequest();
        roomReq.setName("Room 101");
        roomReq.setTotalSeats(80);

        ResponseEntity<ApiResponse<RoomResponse>> roomResp = restTemplate.exchange(
                "/api/v1/admin/cinemas/" + cinemaId + "/rooms",
                HttpMethod.POST,
                new HttpEntity<>(roomReq, headers),
                new ParameterizedTypeReference<>() {}
        );
        Long roomId = roomResp.getBody().getData().getId();

        // Step 3: Create Showtime 1 (14:00 to 16:30)
        CreateShowtimeRequest showtime1Req = new CreateShowtimeRequest();
        showtime1Req.setMovieId(movieId);
        showtime1Req.setRoomId(roomId);
        showtime1Req.setStartTime(LocalDateTime.of(2026, 10, 1, 14, 0));
        showtime1Req.setEndTime(LocalDateTime.of(2026, 10, 1, 16, 30));
        showtime1Req.setPrice(BigDecimal.valueOf(110000));

        ResponseEntity<ApiResponse<ShowtimeResponse>> showtime1Resp = restTemplate.exchange(
                "/api/v1/admin/showtimes",
                HttpMethod.POST,
                new HttpEntity<>(showtime1Req, headers),
                new ParameterizedTypeReference<>() {}
        );
        assertEquals(HttpStatus.OK, showtime1Resp.getStatusCode());
        assertNotNull(showtime1Resp.getBody().getData().getId());

        // Step 4: Create Showtime 2 (15:30 to 18:00) overlapping in same room -> Must fail 409
        CreateShowtimeRequest showtime2Req = new CreateShowtimeRequest();
        showtime2Req.setMovieId(movieId);
        showtime2Req.setRoomId(roomId);
        showtime2Req.setStartTime(LocalDateTime.of(2026, 10, 1, 15, 30));
        showtime2Req.setEndTime(LocalDateTime.of(2026, 10, 1, 18, 0));
        showtime2Req.setPrice(BigDecimal.valueOf(110000));

        ResponseEntity<ApiResponse<Void>> showtime2Resp = restTemplate.exchange(
                "/api/v1/admin/showtimes",
                HttpMethod.POST,
                new HttpEntity<>(showtime2Req, headers),
                new ParameterizedTypeReference<>() {}
        );

        assertEquals(HttpStatus.CONFLICT, showtime2Resp.getStatusCode());
        assertNotNull(showtime2Resp.getBody());
        assertEquals("SHOWTIME_OVERLAP", showtime2Resp.getBody().getStatus());
    }
}
