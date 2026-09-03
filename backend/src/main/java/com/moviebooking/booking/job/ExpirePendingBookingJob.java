package com.moviebooking.booking.job;

import com.moviebooking.booking.entity.Booking;
import com.moviebooking.booking.entity.BookingStatus;
import com.moviebooking.booking.repository.BookingRepository;
import com.moviebooking.booking.repository.BookingSeatRepository;
import com.moviebooking.booking.service.RedisSeatLockService;
import com.moviebooking.booking.service.SeatWebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ExpirePendingBookingJob {

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final RedisSeatLockService redisSeatLockService;
    private final SeatWebSocketService seatWebSocketService;

    /**
     * Runs every 1 minute (60,000 ms) to expire overdue PENDING bookings and free seats.
     */
    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void expirePendingBookings() {
        long lockTtlSeconds = redisSeatLockService.getLockTtlSeconds();
        LocalDateTime cutoffTime = LocalDateTime.now().minusSeconds(lockTtlSeconds);

        List<Booking> overdueBookings = bookingRepository.findByStatusAndCreatedAtBefore(
                BookingStatus.PENDING,
                cutoffTime
        );

        if (overdueBookings.isEmpty()) {
            return;
        }

        log.info("Found {} overdue PENDING bookings to expire", overdueBookings.size());

        for (Booking booking : overdueBookings) {
            log.info("Expiring booking id: {}", booking.getId());

            booking.setStatus(BookingStatus.EXPIRED);

            List<Long> seatIds = booking.getBookingSeats().stream()
                    .map(bs -> bs.getSeat().getId())
                    .toList();
            Long showtimeId = booking.getShowtime().getId();

            // Clear booking seats from database
            bookingSeatRepository.deleteAll(booking.getBookingSeats());
            booking.getBookingSeats().clear();

            // Release Redis locks
            redisSeatLockService.releaseSeatLocks(showtimeId, seatIds);

            // Broadcast WebSocket event SEAT_RELEASED
            seatWebSocketService.broadcastSeatReleased(showtimeId, seatIds);

            bookingRepository.save(booking);
        }
    }
}
