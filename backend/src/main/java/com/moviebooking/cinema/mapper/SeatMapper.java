package com.moviebooking.cinema.mapper;

import com.moviebooking.cinema.dto.response.SeatResponse;
import com.moviebooking.cinema.entity.Seat;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SeatMapper {
    @Mapping(source = "room.id", target = "roomId")
    SeatResponse toResponse(Seat seat);
}
