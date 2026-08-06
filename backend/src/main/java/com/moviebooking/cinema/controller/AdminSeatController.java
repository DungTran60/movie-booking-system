package com.moviebooking.cinema.controller;

import com.moviebooking.cinema.dto.request.GenerateSeatsRequest;
import com.moviebooking.cinema.dto.response.SeatResponse;
import com.moviebooking.cinema.service.SeatService;
import com.moviebooking.common.dto.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/rooms/{roomId}/seats")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminSeatController {

    private final SeatService seatService;

    @PostMapping
    public ResponseEntity<ApiResponse<List<SeatResponse>>> generateSeats(
            @PathVariable Long roomId,
            @Valid @RequestBody GenerateSeatsRequest request
    ) {
        List<SeatResponse> response = seatService.generateSeats(roomId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Seat layout generated successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SeatResponse>>> getSeatsByRoomId(@PathVariable Long roomId) {
        List<SeatResponse> response = seatService.getSeatsByRoomId(roomId);
        return ResponseEntity.ok(ApiResponse.success(response, "Seats retrieved successfully"));
    }
}
