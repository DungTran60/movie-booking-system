package com.moviebooking.cinema.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatResponse {
    private Long id;
    private Long roomId;
    private String rowCode;
    private Integer seatNumber;
    private String seatType;
    private String status;
}
