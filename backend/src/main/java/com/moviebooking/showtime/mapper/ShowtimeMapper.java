package com.moviebooking.showtime.mapper;

import com.moviebooking.cinema.mapper.RoomMapper;
import com.moviebooking.movie.mapper.MovieMapper;
import com.moviebooking.showtime.dto.ShowtimeResponse;
import com.moviebooking.showtime.entity.Showtime;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {MovieMapper.class, RoomMapper.class})
public interface ShowtimeMapper {

    @Mapping(target = "cinemaId", source = "room.cinema.id")
    @Mapping(target = "cinemaName", source = "room.cinema.name")
    ShowtimeResponse toResponse(Showtime showtime);
}
