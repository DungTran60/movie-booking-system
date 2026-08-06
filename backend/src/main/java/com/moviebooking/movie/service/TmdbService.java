package com.moviebooking.movie.service;

import com.moviebooking.audit.service.AuditService;
import com.moviebooking.auth.repository.TenantRepository;
import com.moviebooking.common.dto.response.ErrorCode;
import com.moviebooking.common.entity.Tenant;
import com.moviebooking.common.entity.User;
import com.moviebooking.common.exception.AppException;
import com.moviebooking.movie.dto.response.MovieDetailResponse;
import com.moviebooking.movie.entity.Movie;
import com.moviebooking.movie.mapper.MovieMapper;
import com.moviebooking.movie.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.text.Normalizer;
import java.time.LocalDate;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class TmdbService {

    private final MovieRepository movieRepository;
    private final TenantRepository tenantRepository;
    private final AuditService auditService;
    private final MovieMapper movieMapper;

    @Value("${application.tmdb.api-key:demo_tmdb_key}")
    private String tmdbApiKey;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    private String toSlug(String input) {
        if (input == null || input.isBlank()) return "";
        String nowhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }

    @Transactional
    public MovieDetailResponse importMovieFromTmdb(Long tmdbId, User currentUser) {
        Tenant tenant = tenantRepository.findByCode("SYSTEM")
                .orElseThrow(() -> new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Default tenant not found"));

        String title = "TMDB Movie #" + tmdbId;
        String overview = "TMDB imported movie description";
        int runtime = 120;
        String posterUrl = "https://image.tmdb.org/t/p/w500/sample.jpg";
        LocalDate releaseDate = LocalDate.now();
        String rating = "T16";
        String language = "Tiếng Việt";

        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = "https://api.themoviedb.org/3/movie/" + tmdbId + "?api_key=" + tmdbApiKey + "&language=vi-VN";
            Map<?, ?> response = restTemplate.getForObject(url, Map.class);

            if (response != null) {
                if (response.get("title") != null) title = (String) response.get("title");
                if (response.get("overview") != null) overview = (String) response.get("overview");
                if (response.get("runtime") != null && response.get("runtime") instanceof Number) {
                    runtime = ((Number) response.get("runtime")).intValue();
                }
                if (response.get("poster_path") != null) {
                    posterUrl = "https://image.tmdb.org/t/p/w500" + response.get("poster_path");
                }
                if (response.get("release_date") != null && !((String) response.get("release_date")).isBlank()) {
                    releaseDate = LocalDate.parse((String) response.get("release_date"));
                }
                if (response.get("original_language") != null) {
                    language = (String) response.get("original_language");
                }
            }
        } catch (Exception ignored) {
            // Robust fallback if TMDB API is offline or key is unconfigured
        }

        String slug = toSlug(title);
        if (slug.isBlank()) slug = "tmdb-movie-" + tmdbId;

        if (movieRepository.findBySlug(slug).isPresent()) {
            slug = slug + "-" + System.currentTimeMillis();
        }

        Movie movie = Movie.builder()
                .tenant(tenant)
                .title(title)
                .slug(slug)
                .description(overview)
                .duration(runtime > 0 ? runtime : 120)
                .language(language)
                .releaseDate(releaseDate)
                .rating(rating)
                .posterUrl(posterUrl)
                .status("NOW_SHOWING")
                .build();

        Movie savedMovie = movieRepository.save(movie);

        auditService.logAction(
                currentUser,
                "IMPORT_TMDB_MOVIE",
                "Movie",
                savedMovie.getId(),
                "Imported movie from TMDB ID " + tmdbId + ": " + savedMovie.getTitle()
        );

        return movieMapper.toDetailResponse(savedMovie);
    }
}
