package com.moviebooking.booking.mapper;

import com.moviebooking.booking.dto.BookingResponse;
import com.moviebooking.booking.dto.BookingSeatResponse;
import com.moviebooking.booking.entity.Booking;
import com.moviebooking.booking.entity.BookingSeat;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class BookingMapper {

    public BookingResponse toResponse(Booking booking, LocalDateTime expiresAt) {
        if (booking == null) return null;

        List<BookingSeatResponse> seatResponses = booking.getBookingSeats().stream()
                .map(this::toSeatResponse)
                .collect(Collectors.toList());

        return BookingResponse.builder()
                .id(booking.getId())
                .userId(booking.getUser() != null ? booking.getUser().getId() : null)
                .userEmail(booking.getUser() != null ? booking.getUser().getEmail() : null)
                .showtimeId(booking.getShowtime() != null ? booking.getShowtime().getId() : null)
                .movieTitle(booking.getShowtime() != null && booking.getShowtime().getMovie() != null ? booking.getShowtime().getMovie().getTitle() : null)
                .cinemaName(booking.getShowtime() != null && booking.getShowtime().getRoom() != null && booking.getShowtime().getRoom().getCinema() != null ? booking.getShowtime().getRoom().getCinema().getName() : null)
                .roomName(booking.getShowtime() != null && booking.getShowtime().getRoom() != null ? booking.getShowtime().getRoom().getName() : null)
                .startTime(booking.getShowtime() != null ? booking.getShowtime().getStartTime() : null)
                .endTime(booking.getShowtime() != null ? booking.getShowtime().getEndTime() : null)
                .totalAmount(booking.getTotalAmount())
                .status(booking.getStatus())
                .seats(seatResponses)
                .expiresAt(expiresAt)
                .createdAt(booking.getCreatedAt())
                .build();
    }

    public BookingSeatResponse toSeatResponse(BookingSeat seat) {
        if (seat == null) return null;

        return BookingSeatResponse.builder()
                .seatId(seat.getSeat() != null ? seat.getSeat().getId() : null)
                .rowCode(seat.getSeat() != null ? seat.getSeat().getRowCode() : null)
                .seatNumber(seat.getSeat() != null ? seat.getSeat().getSeatNumber() : null)
                .seatType(seat.getSeat() != null ? seat.getSeat().getSeatType() : null)
                .price(seat.getPrice())
                .build();
    }
}
