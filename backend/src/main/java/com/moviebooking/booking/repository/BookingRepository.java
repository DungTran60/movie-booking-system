package com.moviebooking.booking.repository;

import com.moviebooking.booking.entity.Booking;
import com.moviebooking.booking.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByIdAndUserId(Long id, Long userId);
    List<Booking> findByUserId(Long userId);
    List<Booking> findByShowtimeIdAndStatusIn(Long showtimeId, List<BookingStatus> statuses);
    List<Booking> findByStatusAndCreatedAtBefore(BookingStatus status, java.time.LocalDateTime cutoffTime);
}
