package com.moviebooking.auth;

import com.moviebooking.auth.dto.AuthResponse;
import com.moviebooking.auth.dto.LoginRequest;
import com.moviebooking.auth.dto.LogoutRequest;
import com.moviebooking.auth.dto.RefreshTokenRequest;
import com.moviebooking.auth.dto.RegisterRequest;
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

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class AuthenticationIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("movie_booking_test")
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
    @DisplayName("Full Authentication Integration Flow: Register -> Login -> Refresh Token -> Logout")
    void fullAuthenticationFlowTest() {
        // Step 1: Register
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setFullName("Integration User");
        registerReq.setEmail("integration@example.com");
        registerReq.setPhone("0988776655");
        registerReq.setPassword("Password@123");

        ResponseEntity<ApiResponse<Object>> registerResponse = restTemplate.exchange(
                "/api/v1/auth/register",
                HttpMethod.POST,
                new HttpEntity<>(registerReq),
                new ParameterizedTypeReference<>() {}
        );

        assertEquals(HttpStatus.OK, registerResponse.getStatusCode());
        assertNotNull(registerResponse.getBody());
        assertEquals("SUCCESS", registerResponse.getBody().getStatus());

        // Step 2: Login
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("integration@example.com");
        loginReq.setPassword("Password@123");

        ResponseEntity<ApiResponse<AuthResponse>> loginResponse = restTemplate.exchange(
                "/api/v1/auth/login",
                HttpMethod.POST,
                new HttpEntity<>(loginReq),
                new ParameterizedTypeReference<>() {}
        );

        assertEquals(HttpStatus.OK, loginResponse.getStatusCode());
        assertNotNull(loginResponse.getBody());
        assertEquals("SUCCESS", loginResponse.getBody().getStatus());

        AuthResponse authData = loginResponse.getBody().getData();
        assertNotNull(authData);
        assertNotNull(authData.getAccessToken());
        assertNotNull(authData.getRefreshToken());

        String initialAccessToken = authData.getAccessToken();
        String initialRefreshToken = authData.getRefreshToken();

        // Step 3: Refresh Token
        RefreshTokenRequest refreshReq = new RefreshTokenRequest();
        refreshReq.setRefreshToken(initialRefreshToken);

        ResponseEntity<ApiResponse<AuthResponse>> refreshResponse = restTemplate.exchange(
                "/api/v1/auth/refresh",
                HttpMethod.POST,
                new HttpEntity<>(refreshReq),
                new ParameterizedTypeReference<>() {}
        );

        assertEquals(HttpStatus.OK, refreshResponse.getStatusCode());
        assertNotNull(refreshResponse.getBody());
        assertEquals("SUCCESS", refreshResponse.getBody().getStatus());

        AuthResponse refreshedData = refreshResponse.getBody().getData();
        assertNotNull(refreshedData);
        assertNotNull(refreshedData.getAccessToken());
        assertNotNull(refreshedData.getRefreshToken());
        assertNotEquals(initialRefreshToken, refreshedData.getRefreshToken());

        // Step 4: Logout (Requires Authentication Header)
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(refreshedData.getAccessToken());

        LogoutRequest logoutReq = new LogoutRequest();
        logoutReq.setRefreshToken(refreshedData.getRefreshToken());

        HttpEntity<LogoutRequest> logoutEntity = new HttpEntity<>(logoutReq, headers);

        ResponseEntity<ApiResponse<Void>> logoutResponse = restTemplate.exchange(
                "/api/v1/auth/logout",
                HttpMethod.POST,
                logoutEntity,
                new ParameterizedTypeReference<>() {}
        );

        assertEquals(HttpStatus.OK, logoutResponse.getStatusCode());
        assertNotNull(logoutResponse.getBody());
        assertEquals("SUCCESS", logoutResponse.getBody().getStatus());
    }
}
