package com.moviebooking.showtime.repository;

import com.moviebooking.showtime.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {

    @Query("""
        SELECT s FROM Showtime s
        WHERE s.room.id = :roomId
          AND s.status != 'CANCELLED'
          AND (:startTime < s.endTime AND :endTime > s.startTime)
    """)
    List<Showtime> findOverlappingShowtimes(
            @Param("roomId") Long roomId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    @Query("""
        SELECT s FROM Showtime s
        JOIN FETCH s.movie m
        JOIN FETCH s.room r
        JOIN FETCH r.cinema c
        WHERE (:movieId IS NULL OR m.id = :movieId)
          AND (:cinemaId IS NULL OR c.id = :cinemaId)
          AND (:startWindow IS NULL OR s.startTime >= :startWindow)
          AND (:endWindow IS NULL OR s.startTime <= :endWindow)
        ORDER BY s.startTime ASC
    """)
    List<Showtime> findShowtimesByFilters(
            @Param("movieId") Long movieId,
            @Param("cinemaId") Long cinemaId,
            @Param("startWindow") LocalDateTime startWindow,
            @Param("endWindow") LocalDateTime endWindow
    );
}
