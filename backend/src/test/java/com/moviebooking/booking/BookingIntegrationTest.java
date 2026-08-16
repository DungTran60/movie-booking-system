package com.moviebooking.booking;

import com.moviebooking.auth.dto.AuthResponse;
import com.moviebooking.auth.dto.LoginRequest;
import com.moviebooking.auth.dto.RegisterRequest;
import com.moviebooking.booking.dto.BookingResponse;
import com.moviebooking.booking.dto.CreateBookingRequest;
import com.moviebooking.booking.service.RedisSeatLockService;
import com.moviebooking.cinema.dto.request.CreateCinemaRequest;
import com.moviebooking.cinema.dto.request.CreateRoomRequest;
import com.moviebooking.cinema.dto.request.GenerateSeatsRequest;
import com.moviebooking.cinema.dto.response.CinemaResponse;
import com.moviebooking.cinema.dto.response.RoomResponse;
import com.moviebooking.cinema.entity.Seat;
import com.moviebooking.cinema.repository.SeatRepository;
import com.moviebooking.common.dto.response.ApiResponse;
import com.moviebooking.movie.dto.request.CreateMovieRequest;
import com.moviebooking.movie.dto.response.MovieDetailResponse;
import com.moviebooking.showtime.dto.CreateShowtimeRequest;
import com.moviebooking.showtime.dto.ShowtimeResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
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
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class BookingIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("movie_booking_test_booking")
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

    @Autowired
    private SeatRepository seatRepository;

    @MockBean
    private RedisSeatLockService redisSeatLockService;

    @Test
    @DisplayName("Complete booking lifecycle: Register customer, lock seats (201 Created), fetch details (200 OK), double booking prevention (409 Conflict)")
    void bookingFlow_IntegrationTest() {
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
        String adminToken = loginResp.getBody().getData().getAccessToken();

        HttpHeaders adminHeaders = new HttpHeaders();
        adminHeaders.setBearerAuth(adminToken);

        // Step 1: Create Movie
        CreateMovieRequest movieReq = new CreateMovieRequest();
        movieReq.setTitle("Dune Part Two Integration");
        movieReq.setDuration(166);
        movieReq.setLanguage("English");
        movieReq.setRating("T13");

        ResponseEntity<ApiResponse<MovieDetailResponse>> movieResp = restTemplate.exchange(
                "/api/v1/admin/movies",
                HttpMethod.POST,
                new HttpEntity<>(movieReq, adminHeaders),
                new ParameterizedTypeReference<>() {}
        );
        Long movieId = movieResp.getBody().getData().getId();

        // Step 2: Create Cinema & Room
        CreateCinemaRequest cinemaReq = new CreateCinemaRequest();
        cinemaReq.setName("CineStar Complex");
        cinemaReq.setAddress("456 Booking Way");
        cinemaReq.setCity("Hanoi");

        ResponseEntity<ApiResponse<CinemaResponse>> cinemaResp = restTemplate.exchange(
                "/api/v1/admin/cinemas",
                HttpMethod.POST,
                new HttpEntity<>(cinemaReq, adminHeaders),
                new ParameterizedTypeReference<>() {}
        );
        Long cinemaId = cinemaResp.getBody().getData().getId();

        CreateRoomRequest roomReq = new CreateRoomRequest();
        roomReq.setName("Room 01");
        roomReq.setTotalSeats(30);

        ResponseEntity<ApiResponse<RoomResponse>> roomResp = restTemplate.exchange(
                "/api/v1/admin/cinemas/" + cinemaId + "/rooms",
                HttpMethod.POST,
                new HttpEntity<>(roomReq, adminHeaders),
                new ParameterizedTypeReference<>() {}
        );
        Long roomId = roomResp.getBody().getData().getId();

        // Step 3: Generate Seats for Room
        GenerateSeatsRequest seatReq = new GenerateSeatsRequest();
        seatReq.setRowCount(5);
        seatReq.setColsPerRow(6);

        restTemplate.exchange(
                "/api/v1/admin/rooms/" + roomId + "/seats",
                HttpMethod.POST,
                new HttpEntity<>(seatReq, adminHeaders),
                new ParameterizedTypeReference<>() {}
        );

        List<Seat> roomSeats = seatRepository.findByRoomId(roomId);
        assertFalse(roomSeats.isEmpty());
        Long seatId1 = roomSeats.get(0).getId();

        // Step 4: Create Showtime
        CreateShowtimeRequest showtimeReq = new CreateShowtimeRequest();
        showtimeReq.setMovieId(movieId);
        showtimeReq.setRoomId(roomId);
        showtimeReq.setStartTime(LocalDateTime.now().plusDays(1).withHour(19).withMinute(0));
        showtimeReq.setEndTime(LocalDateTime.now().plusDays(1).withHour(21).withMinute(46));
        showtimeReq.setPrice(BigDecimal.valueOf(120000));

        ResponseEntity<ApiResponse<ShowtimeResponse>> showtimeResp = restTemplate.exchange(
                "/api/v1/admin/showtimes",
                HttpMethod.POST,
                new HttpEntity<>(showtimeReq, adminHeaders),
                new ParameterizedTypeReference<>() {}
        );
        Long showtimeId = showtimeResp.getBody().getData().getId();

        // Step 5: Register & Login Customer 1
        RegisterRequest regReq1 = new RegisterRequest();
        regReq1.setFullName("Booking Customer One");
        regReq1.setEmail("customer1_booking@moviebooking.com");
        regReq1.setPassword("Customer@123");

        restTemplate.exchange("/api/v1/auth/register", HttpMethod.POST, new HttpEntity<>(regReq1), new ParameterizedTypeReference<>() {});

        LoginRequest custLoginReq1 = new LoginRequest();
        custLoginReq1.setEmail("customer1_booking@moviebooking.com");
        custLoginReq1.setPassword("Customer@123");

        ResponseEntity<ApiResponse<AuthResponse>> custLoginResp1 = restTemplate.exchange("/api/v1/auth/login", HttpMethod.POST, new HttpEntity<>(custLoginReq1), new ParameterizedTypeReference<>() {});
        String customer1Token = custLoginResp1.getBody().getData().getAccessToken();

        HttpHeaders cust1Headers = new HttpHeaders();
        cust1Headers.setBearerAuth(customer1Token);

        // Mock Redis lock success
        when(redisSeatLockService.acquireSeatLocks(eq(showtimeId), anyList(), anyLong())).thenReturn(true);
        when(redisSeatLockService.getLockTtlSeconds()).thenReturn(300L);

        // Step 6: Customer 1 creates booking for seatId1 -> 201 Created
        CreateBookingRequest bookingReq1 = CreateBookingRequest.builder()
                .showtimeId(showtimeId)
                .seatIds(List.of(seatId1))
                .build();

        ResponseEntity<ApiResponse<BookingResponse>> createBookingResp1 = restTemplate.exchange(
                "/api/v1/bookings",
                HttpMethod.POST,
                new HttpEntity<>(bookingReq1, cust1Headers),
                new ParameterizedTypeReference<>() {}
        );

        assertEquals(HttpStatus.CREATED, createBookingResp1.getStatusCode());
        assertNotNull(createBookingResp1.getBody().getData().getId());
        Long bookingId1 = createBookingResp1.getBody().getData().getId();

        // Step 7: Customer 1 retrieves booking details -> 200 OK
        ResponseEntity<ApiResponse<BookingResponse>> getBookingResp = restTemplate.exchange(
                "/api/v1/bookings/" + bookingId1,
                HttpMethod.GET,
                new HttpEntity<>(cust1Headers),
                new ParameterizedTypeReference<>() {}
        );

        assertEquals(HttpStatus.OK, getBookingResp.getStatusCode());
        assertEquals(bookingId1, getBookingResp.getBody().getData().getId());

        // Step 8: Customer 2 attempts to book SAME seatId1 -> Must fail with 409 CONFLICT (SEAT_ALREADY_BOOKED)
        RegisterRequest regReq2 = new RegisterRequest();
        regReq2.setFullName("Booking Customer Two");
        regReq2.setEmail("customer2_booking@moviebooking.com");
        regReq2.setPassword("Customer@123");

        restTemplate.exchange("/api/v1/auth/register", HttpMethod.POST, new HttpEntity<>(regReq2), new ParameterizedTypeReference<>() {});

        LoginRequest custLoginReq2 = new LoginRequest();
        custLoginReq2.setEmail("customer2_booking@moviebooking.com");
        custLoginReq2.setPassword("Customer@123");

        ResponseEntity<ApiResponse<AuthResponse>> custLoginResp2 = restTemplate.exchange("/api/v1/auth/login", HttpMethod.POST, new HttpEntity<>(custLoginReq2), new ParameterizedTypeReference<>() {});
        String customer2Token = custLoginResp2.getBody().getData().getAccessToken();

        HttpHeaders cust2Headers = new HttpHeaders();
        cust2Headers.setBearerAuth(customer2Token);

        ResponseEntity<ApiResponse<Void>> createBookingResp2 = restTemplate.exchange(
                "/api/v1/bookings",
                HttpMethod.POST,
                new HttpEntity<>(bookingReq1, cust2Headers),
                new ParameterizedTypeReference<>() {}
        );

        assertEquals(HttpStatus.CONFLICT, createBookingResp2.getStatusCode());
        assertEquals("SEAT_ALREADY_BOOKED", createBookingResp2.getBody().getStatus());

        // Step 9: Customer 2 attempts to view Customer 1's booking -> Must fail with 403 FORBIDDEN
        ResponseEntity<ApiResponse<Void>> forbiddenResp = restTemplate.exchange(
                "/api/v1/bookings/" + bookingId1,
                HttpMethod.GET,
                new HttpEntity<>(cust2Headers),
                new ParameterizedTypeReference<>() {}
        );

        assertEquals(HttpStatus.FORBIDDEN, forbiddenResp.getStatusCode());
    }
}
