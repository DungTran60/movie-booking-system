package com.moviebooking.booking.dto;

import com.moviebooking.booking.entity.BookingStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {
    private Long id;
    private Long userId;
    private String userEmail;
    private Long showtimeId;
    private String movieTitle;
    private String cinemaName;
    private String roomName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal totalAmount;
    private BookingStatus status;
    private List<BookingSeatResponse> seats;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}
