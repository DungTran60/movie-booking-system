package com.moviebooking.booking.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingSeatResponse {
    private Long seatId;
    private String rowCode;
    private Integer seatNumber;
    private String seatType;
    private BigDecimal price;
}
