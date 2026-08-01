package com.moviebooking.movie.controller;

import com.moviebooking.common.dto.response.ApiResponse;
import com.moviebooking.common.entity.User;
import com.moviebooking.movie.dto.request.CreateMovieRequest;
import com.moviebooking.movie.dto.request.UpdateMovieRequest;
import com.moviebooking.movie.dto.response.MovieDetailResponse;
import com.moviebooking.movie.service.MovieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/movies")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminMovieController {

    private final MovieService movieService;

    @PostMapping
    public ResponseEntity<ApiResponse<MovieDetailResponse>> createMovie(
            @Valid @RequestBody CreateMovieRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        MovieDetailResponse response = movieService.createMovie(request, currentUser);
        return ResponseEntity.ok(ApiResponse.success(response, "Movie created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MovieDetailResponse>> getMovieById(@PathVariable Long id) {
        MovieDetailResponse response = movieService.getMovieById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Movie retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MovieDetailResponse>> updateMovie(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMovieRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        MovieDetailResponse response = movieService.updateMovie(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success(response, "Movie updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMovie(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        movieService.deleteMovie(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success(null, "Movie soft-deleted successfully"));
    }
}
