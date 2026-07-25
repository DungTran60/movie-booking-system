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
public class CinemaResponse {
    private Long id;
    private String name;
    private String address;
    private String city;
    private String status;
}
