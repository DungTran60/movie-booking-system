package com.moviebooking.booking.controller;

import com.moviebooking.booking.dto.CreateBookingRequest;
import com.moviebooking.booking.dto.BookingResponse;
import com.moviebooking.booking.service.BookingService;
import com.moviebooking.common.dto.response.ApiResponse;
import com.moviebooking.common.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        BookingResponse response = bookingService.createBooking(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Seat locks acquired and booking created successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingDetails(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        boolean isAdmin = currentUser.getUserRoles().stream()
                .anyMatch(ur -> "ADMIN".equalsIgnoreCase(ur.getRole().getName()));

        BookingResponse response = bookingService.getBookingDetails(id, currentUser.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success(response, "Booking details retrieved successfully"));
    }
}
