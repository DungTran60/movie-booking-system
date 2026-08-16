package com.moviebooking.booking.repository;

import com.moviebooking.booking.entity.SeatLock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatLockRepository extends JpaRepository<SeatLock, Long> {
    List<SeatLock> findByShowtimeIdAndSeatIdIn(Long showtimeId, List<Long> seatIds);
}
