package com.moviebooking.movie.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovieDetailResponse {
    private Long id;
    private String title;
    private String slug;
    private String description;
    private Integer duration;
    private String language;
    private LocalDate releaseDate;
    private String trailerUrl;
    private String rating;
    private String posterUrl;
    private String status;
    private List<GenreResponse> genres;
}
