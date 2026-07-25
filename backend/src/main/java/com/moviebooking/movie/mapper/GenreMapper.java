package com.moviebooking.movie.mapper;

import com.moviebooking.movie.dto.response.GenreResponse;
import com.moviebooking.movie.entity.Genre;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface GenreMapper {
    GenreResponse toResponse(Genre genre);
}
