package com.moviebooking.movie.service;

import com.moviebooking.audit.service.AuditService;
import com.moviebooking.auth.repository.TenantRepository;
import com.moviebooking.common.dto.response.ErrorCode;
import com.moviebooking.common.dto.response.PageResponse;
import com.moviebooking.common.entity.Tenant;
import com.moviebooking.common.entity.User;
import com.moviebooking.common.exception.AppException;
import com.moviebooking.movie.dto.request.CreateMovieRequest;
import com.moviebooking.movie.dto.request.UpdateMovieRequest;
import com.moviebooking.movie.dto.response.MovieDetailResponse;
import com.moviebooking.movie.dto.response.MovieResponse;
import com.moviebooking.movie.entity.Genre;
import com.moviebooking.movie.entity.Movie;
import com.moviebooking.movie.mapper.MovieMapper;
import com.moviebooking.movie.repository.GenreRepository;
import com.moviebooking.movie.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class MovieService {

    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;
    private final TenantRepository tenantRepository;
    private final AuditService auditService;
    private final MovieMapper movieMapper;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    private String toSlug(String input) {
        if (input == null || input.isBlank()) return "";
        String nowhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }

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
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Movie not found with slug: " + slug));

        return movieMapper.toDetailResponse(movie);
    }

    @Transactional(readOnly = true)
    public MovieDetailResponse getMovieById(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Movie not found with id: " + id));

        return movieMapper.toDetailResponse(movie);
    }

    @Transactional
    public MovieDetailResponse createMovie(CreateMovieRequest request, User currentUser) {
        Tenant tenant = tenantRepository.findByCode("SYSTEM")
                .orElseThrow(() -> new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Default tenant not found"));

        String slug = (request.getSlug() != null && !request.getSlug().isBlank())
                ? request.getSlug().trim()
                : toSlug(request.getTitle());

        if (movieRepository.findBySlug(slug).isPresent()) {
            slug = slug + "-" + System.currentTimeMillis();
        }

        Set<Genre> genres = new HashSet<>();
        if (request.getGenreIds() != null && !request.getGenreIds().isEmpty()) {
            genres.addAll(genreRepository.findAllById(request.getGenreIds()));
        }

        Movie movie = Movie.builder()
                .tenant(tenant)
                .title(request.getTitle())
                .slug(slug)
                .description(request.getDescription())
                .duration(request.getDuration())
                .language(request.getLanguage())
                .releaseDate(request.getReleaseDate())
                .trailerUrl(request.getTrailerUrl())
                .rating(request.getRating())
                .posterUrl(request.getPosterUrl())
                .status(request.getStatus() != null ? request.getStatus() : "NOW_SHOWING")
                .genres(genres)
                .build();

        Movie savedMovie = movieRepository.save(movie);

        // Audit Log BR-06
        auditService.logAction(
                currentUser,
                "CREATE_MOVIE",
                "Movie",
                savedMovie.getId(),
                "Created movie: " + savedMovie.getTitle() + " (slug: " + savedMovie.getSlug() + ")"
        );

        return movieMapper.toDetailResponse(savedMovie);
    }

    @Transactional
    public MovieDetailResponse updateMovie(Long id, UpdateMovieRequest request, User currentUser) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Movie not found with id: " + id));

        movie.setTitle(request.getTitle());
        movie.setDescription(request.getDescription());
        movie.setDuration(request.getDuration());
        movie.setLanguage(request.getLanguage());
        movie.setReleaseDate(request.getReleaseDate());
        movie.setTrailerUrl(request.getTrailerUrl());
        movie.setRating(request.getRating());
        movie.setPosterUrl(request.getPosterUrl());

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            movie.setStatus(request.getStatus());
        }

        if (request.getSlug() != null && !request.getSlug().isBlank()) {
            movie.setSlug(request.getSlug().trim());
        }

        if (request.getGenreIds() != null) {
            Set<Genre> genres = new HashSet<>(genreRepository.findAllById(request.getGenreIds()));
            movie.setGenres(genres);
        }

        Movie updatedMovie = movieRepository.save(movie);

        // Audit Log BR-06
        auditService.logAction(
                currentUser,
                "UPDATE_MOVIE",
                "Movie",
                updatedMovie.getId(),
                "Updated movie: " + updatedMovie.getTitle()
        );

        return movieMapper.toDetailResponse(updatedMovie);
    }

    @Transactional
    public void deleteMovie(Long id, User currentUser) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Movie not found with id: " + id));

        // Soft Delete: status set to DELETED
        movie.setStatus("DELETED");
        movieRepository.save(movie);

        // Audit Log BR-06
        auditService.logAction(
                currentUser,
                "DELETE_MOVIE",
                "Movie",
                movie.getId(),
                "Soft deleted movie: " + movie.getTitle()
        );
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
