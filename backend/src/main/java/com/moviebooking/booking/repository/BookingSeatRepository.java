package com.moviebooking.booking.repository;

import com.moviebooking.booking.entity.BookingSeat;
import com.moviebooking.booking.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingSeatRepository extends JpaRepository<BookingSeat, Long> {

    @Query("SELECT bs FROM BookingSeat bs WHERE bs.showtime.id = :showtimeId AND bs.seat.id IN :seatIds AND bs.booking.status IN :statuses")
    List<BookingSeat> findExistingBookedSeats(
            @Param("showtimeId") Long showtimeId,
            @Param("seatIds") List<Long> seatIds,
            @Param("statuses") List<BookingStatus> statuses
    );

    @Query("SELECT bs.seat.id FROM BookingSeat bs WHERE bs.showtime.id = :showtimeId AND bs.booking.status IN :statuses")
    List<Long> findBookedSeatIdsByShowtime(
            @Param("showtimeId") Long showtimeId,
            @Param("statuses") List<BookingStatus> statuses
    );
}
