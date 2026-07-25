package com.moviebooking.cinema.mapper;

import com.moviebooking.cinema.dto.response.CinemaResponse;
import com.moviebooking.cinema.entity.Cinema;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CinemaMapper {
    CinemaResponse toResponse(Cinema cinema);
}
