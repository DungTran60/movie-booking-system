package com.moviebooking.movie.controller;

import com.moviebooking.common.dto.response.ApiResponse;
import com.moviebooking.common.dto.response.PageResponse;
import com.moviebooking.movie.dto.response.MovieDetailResponse;
import com.moviebooking.movie.dto.response.MovieResponse;
import com.moviebooking.movie.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<MovieResponse>>> getMovies(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        PageResponse<MovieResponse> response = movieService.getMovies(status, search, page, size, sort);
        return ResponseEntity.ok(ApiResponse.success(response, "Movies retrieved successfully"));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<MovieDetailResponse>> getMovieBySlug(@PathVariable String slug) {
        MovieDetailResponse response = movieService.getMovieBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(response, "Movie detail retrieved successfully"));
    }
}
