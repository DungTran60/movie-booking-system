package com.moviebooking.auth.controller;

import com.moviebooking.auth.dto.AuthResponse;
import com.moviebooking.auth.dto.LoginRequest;
import com.moviebooking.auth.dto.LogoutRequest;
import com.moviebooking.auth.dto.RefreshTokenRequest;
import com.moviebooking.auth.dto.RegisterRequest;
import com.moviebooking.auth.service.AuthService;
import com.moviebooking.common.dto.response.ApiResponse;
import com.moviebooking.common.dto.response.UserResponse;
import com.moviebooking.common.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success(response, "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refresh(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Token refreshed successfully"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestBody(required = false) LogoutRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        authService.logout(request, currentUser);
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out successfully"));
    }
}
