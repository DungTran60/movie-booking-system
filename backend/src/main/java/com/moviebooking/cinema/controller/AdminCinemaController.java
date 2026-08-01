package com.moviebooking.cinema.controller;

import com.moviebooking.cinema.dto.request.CreateCinemaRequest;
import com.moviebooking.cinema.dto.request.UpdateCinemaRequest;
import com.moviebooking.cinema.dto.response.CinemaResponse;
import com.moviebooking.cinema.service.CinemaService;
import com.moviebooking.common.dto.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/cinemas")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminCinemaController {

    private final CinemaService cinemaService;

    @PostMapping
    public ResponseEntity<ApiResponse<CinemaResponse>> createCinema(@Valid @RequestBody CreateCinemaRequest request) {
        CinemaResponse response = cinemaService.createCinema(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Cinema created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CinemaResponse>>> getAllCinemas() {
        List<CinemaResponse> response = cinemaService.getAllCinemas();
        return ResponseEntity.ok(ApiResponse.success(response, "Cinemas retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CinemaResponse>> getCinemaById(@PathVariable Long id) {
        CinemaResponse response = cinemaService.getCinemaById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Cinema retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CinemaResponse>> updateCinema(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCinemaRequest request
    ) {
        CinemaResponse response = cinemaService.updateCinema(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Cinema updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCinema(@PathVariable Long id) {
        cinemaService.deleteCinema(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Cinema deactivated successfully"));
    }
}
