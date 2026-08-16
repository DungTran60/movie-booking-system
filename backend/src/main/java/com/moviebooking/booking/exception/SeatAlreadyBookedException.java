package com.moviebooking.booking.exception;

import com.moviebooking.common.dto.response.ErrorCode;
import com.moviebooking.common.exception.AppException;

public class SeatAlreadyBookedException extends AppException {
    public SeatAlreadyBookedException(String message) {
        super(ErrorCode.SEAT_ALREADY_BOOKED, message);
    }
}
