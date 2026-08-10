package com.moviebooking.showtime.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShowtimeSeatResponse {
    private Long id;
    private Long seatId;
    private String rowCode;
    private Integer seatNumber;
    private String seatType;
    private BigDecimal price;
    private String status; // AVAILABLE, LOCKED, BOOKED
}
