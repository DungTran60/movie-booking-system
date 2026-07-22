package com.moviebooking.booking.service;

import com.moviebooking.booking.dto.BookingResponse;
import com.moviebooking.common.dto.response.ErrorCode;
import com.moviebooking.common.entity.User;
import com.moviebooking.common.exception.AppException;
import org.springframework.stereotype.Service;

@Service
public class BookingService {

    public BookingResponse getBookingDetails(Long bookingId, User currentUser) {
        BookingResponse booking = BookingResponse.builder()
                .id(bookingId)
                .userId(currentUser != null ? currentUser.getId() : -1L)
                .movieTitle("Avengers: Endgame")
                .totalPrice(150000.0)
                .status("CONFIRMED")
                .build();

        if (currentUser == null || !booking.getUserId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN, "Access denied: You do not own this booking");
        }

        return booking;
    }
}
