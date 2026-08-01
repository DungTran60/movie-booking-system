package com.moviebooking.cinema.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCinemaRequest {

    @NotBlank(message = "Cinema name is required")
    private String name;

    @NotBlank(message = "Cinema address is required")
    private String address;

    private String city;

    private String status;
}
