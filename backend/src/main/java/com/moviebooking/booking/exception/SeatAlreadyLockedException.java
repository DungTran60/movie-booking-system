package com.moviebooking.booking.exception;

import com.moviebooking.common.dto.response.ErrorCode;
import com.moviebooking.common.exception.AppException;

public class SeatAlreadyLockedException extends AppException {
    public SeatAlreadyLockedException(String message) {
        super(ErrorCode.SEAT_ALREADY_LOCKED, message);
    }
}
