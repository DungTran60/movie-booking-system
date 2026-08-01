package com.moviebooking.movie.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
public class CreateMovieRequest {

    @NotBlank(message = "Movie title is required")
    private String title;

    private String slug;

    private String description;

    @NotNull(message = "Movie duration is required")
    @Min(value = 1, message = "Duration must be greater than 0")
    private Integer duration;

    private String language;

    private LocalDate releaseDate;

    private String trailerUrl;

    private String rating;

    private String posterUrl;

    private String status = "NOW_SHOWING";

    private Set<Long> genreIds;
}
