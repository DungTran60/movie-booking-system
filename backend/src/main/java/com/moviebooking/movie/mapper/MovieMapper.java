package com.moviebooking.movie.mapper;

import com.moviebooking.movie.dto.response.MovieDetailResponse;
import com.moviebooking.movie.dto.response.MovieResponse;
import com.moviebooking.movie.entity.Movie;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {GenreMapper.class})
public interface MovieMapper {

    MovieResponse toResponse(Movie movie);

    MovieDetailResponse toDetailResponse(Movie movie);
}
