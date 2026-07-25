package com.moviebooking.movie.repository;

import com.moviebooking.movie.entity.Movie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {

    Optional<Movie> findBySlug(String slug);

    @Query("SELECT DISTINCT m FROM Movie m LEFT JOIN FETCH m.genres WHERE (:status IS NULL OR m.status = :status) AND (:search IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Movie> findByStatusAndSearch(@Param("status") String status, @Param("search") String search, Pageable pageable);
}
