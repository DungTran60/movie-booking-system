package com.moviebooking.movie.service;

import com.moviebooking.common.dto.response.ErrorCode;
import com.moviebooking.common.dto.response.PageResponse;
import com.moviebooking.common.exception.AppException;
import com.moviebooking.movie.dto.response.MovieDetailResponse;
import com.moviebooking.movie.dto.response.MovieResponse;
import com.moviebooking.movie.entity.Movie;
import com.moviebooking.movie.mapper.MovieMapper;
import com.moviebooking.movie.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MovieService {

    private final MovieRepository movieRepository;
    private final MovieMapper movieMapper;

    @Transactional(readOnly = true)
    public PageResponse<MovieResponse> getMovies(String status, String search, int page, int size, String sort) {
        int boundedSize = Math.min(Math.max(size, 1), 50);
        int boundedPage = Math.max(page, 0);

        Pageable pageable = parseSortAndCreatePageable(boundedPage, boundedSize, sort);

        String searchPattern = (search != null && !search.isBlank()) ? search.trim() : null;
        String statusFilter = (status != null && !status.isBlank()) ? status.trim() : null;

        Page<Movie> moviePage = movieRepository.findByStatusAndSearch(statusFilter, searchPattern, pageable);
        List<MovieResponse> content = moviePage.getContent().stream()
                .map(movieMapper::toResponse)
                .toList();

        return PageResponse.of(content, moviePage);
    }

    @Transactional(readOnly = true)
    public MovieDetailResponse getMovieBySlug(String slug) {
        Movie movie = movieRepository.findBySlug(slug)
                .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_ERROR, "Movie not found with slug: " + slug));

        return movieMapper.toDetailResponse(movie);
    }

    private Pageable parseSortAndCreatePageable(int page, int size, String sort) {
        if (sort == null || sort.isBlank()) {
            return PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        }

        String[] sortParts = sort.split(",");
        String property = sortParts[0].trim();
        Sort.Direction direction = (sortParts.length > 1 && "asc".equalsIgnoreCase(sortParts[1].trim()))
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        return PageRequest.of(page, size, Sort.by(direction, property));
    }
}
