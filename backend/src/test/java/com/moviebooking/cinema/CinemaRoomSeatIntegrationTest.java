package com.moviebooking.cinema;

import com.moviebooking.auth.dto.AuthResponse;
import com.moviebooking.auth.dto.LoginRequest;
import com.moviebooking.cinema.dto.request.CreateCinemaRequest;
import com.moviebooking.cinema.dto.request.CreateRoomRequest;
import com.moviebooking.cinema.dto.request.GenerateSeatsRequest;
import com.moviebooking.cinema.dto.response.CinemaResponse;
import com.moviebooking.cinema.dto.response.RoomResponse;
import com.moviebooking.cinema.dto.response.SeatResponse;
import com.moviebooking.common.dto.response.ApiResponse;
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

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class CinemaRoomSeatIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("movie_booking_test_cinema")
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
    @DisplayName("End-to-End Integration Flow: Create Cinema -> Create Room -> Generate Seat Layout")
    void fullCinemaRoomSeatFlowTest() {
        // Step 0: Login as Admin (seeded admin: admin@moviebooking.com / Admin@123)
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

        // Step 1: Create Cinema
        CreateCinemaRequest cinemaReq = new CreateCinemaRequest();
        cinemaReq.setName("CineTicket Integration Mall");
        cinemaReq.setAddress("456 Test Blvd");
        cinemaReq.setCity("HCMC");
        cinemaReq.setStatus("ACTIVE");

        ResponseEntity<ApiResponse<CinemaResponse>> cinemaResp = restTemplate.exchange(
                "/api/v1/admin/cinemas",
                HttpMethod.POST,
                new HttpEntity<>(cinemaReq, headers),
                new ParameterizedTypeReference<>() {}
        );

        assertEquals(HttpStatus.OK, cinemaResp.getStatusCode());
        assertNotNull(cinemaResp.getBody().getData());
        Long cinemaId = cinemaResp.getBody().getData().getId();
        assertNotNull(cinemaId);

        // Step 2: Create Room in Cinema
        CreateRoomRequest roomReq = new CreateRoomRequest();
        roomReq.setName("IMAX Room 1");
        roomReq.setTotalSeats(100);

        ResponseEntity<ApiResponse<RoomResponse>> roomResp = restTemplate.exchange(
                "/api/v1/admin/cinemas/" + cinemaId + "/rooms",
                HttpMethod.POST,
                new HttpEntity<>(roomReq, headers),
                new ParameterizedTypeReference<>() {}
        );

        assertEquals(HttpStatus.OK, roomResp.getStatusCode());
        assertNotNull(roomResp.getBody().getData());
        Long roomId = roomResp.getBody().getData().getId();
        assertNotNull(roomId);

        // Step 3: Generate Seat Layout for Room
        GenerateSeatsRequest seatsReq = new GenerateSeatsRequest();
        seatsReq.setRowCount(4);
        seatsReq.setColsPerRow(5);
        seatsReq.setVipRowStart(2);
        seatsReq.setVipRowEnd(3);
        seatsReq.setCoupleRowLast(true);

        ResponseEntity<ApiResponse<List<SeatResponse>>> seatsResp = restTemplate.exchange(
                "/api/v1/admin/rooms/" + roomId + "/seats",
                HttpMethod.POST,
                new HttpEntity<>(seatsReq, headers),
                new ParameterizedTypeReference<>() {}
        );

        assertEquals(HttpStatus.OK, seatsResp.getStatusCode());
        assertNotNull(seatsResp.getBody().getData());
        List<SeatResponse> seats = seatsResp.getBody().getData();
        assertEquals(20, seats.size()); // 4 rows * 5 cols = 20 seats
    }
}
