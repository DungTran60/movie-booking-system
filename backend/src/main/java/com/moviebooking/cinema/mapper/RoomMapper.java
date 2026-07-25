package com.moviebooking.cinema.mapper;

import com.moviebooking.cinema.dto.response.RoomResponse;
import com.moviebooking.cinema.entity.Room;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoomMapper {
    @Mapping(source = "cinema.id", target = "cinemaId")
    RoomResponse toResponse(Room room);
}
