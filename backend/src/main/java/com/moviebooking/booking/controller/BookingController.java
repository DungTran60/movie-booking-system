package com.moviebooking.booking.controller;

import com.moviebooking.booking.dto.BookingResponse;
import com.moviebooking.booking.service.BookingService;
import com.moviebooking.common.dto.response.ApiResponse;
import com.moviebooking.common.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        BookingResponse booking = bookingService.getBookingDetails(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success(booking, "Booking details retrieved successfully"));
    }
}
