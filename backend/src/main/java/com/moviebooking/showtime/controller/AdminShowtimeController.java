package com.moviebooking.showtime.controller;

import com.moviebooking.common.dto.response.ApiResponse;
import com.moviebooking.common.entity.User;
import com.moviebooking.showtime.dto.CreateShowtimeRequest;
import com.moviebooking.showtime.dto.ShowtimeResponse;
import com.moviebooking.showtime.service.ShowtimeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/showtimes")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminShowtimeController {

    private final ShowtimeService showtimeService;

    @PostMapping
    public ResponseEntity<ApiResponse<ShowtimeResponse>> createShowtime(
            @Valid @RequestBody CreateShowtimeRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        ShowtimeResponse response = showtimeService.createShowtime(request, currentUser);
        return ResponseEntity.ok(ApiResponse.success(response, "Showtime created successfully"));
    }
}
