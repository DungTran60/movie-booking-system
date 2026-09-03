package com.moviebooking.booking.job;

import com.moviebooking.booking.entity.BookingStatus;
import com.moviebooking.booking.entity.SeatLock;
import com.moviebooking.booking.repository.BookingSeatRepository;
import com.moviebooking.booking.repository.SeatLockRepository;
import com.moviebooking.booking.service.RedisSeatLockService;
import com.moviebooking.booking.service.SeatWebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReleaseExpiredSeatLockJob {

    private final SeatLockRepository seatLockRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final RedisSeatLockService redisSeatLockService;
    private final SeatWebSocketService seatWebSocketService;

    private static final List<BookingStatus> CONFIRMED_STATUSES = List.of(
            BookingStatus.CONFIRMED,
            BookingStatus.CHECKED_IN
    );

    /**
     * Runs every 30 seconds to clean up expired seat locks and synchronize UI via WebSocket.
     */
    @Scheduled(fixedDelay = 30000)
    @Transactional
    public void releaseExpiredSeatLocks() {
        LocalDateTime now = LocalDateTime.now();
        List<SeatLock> expiredLocks = seatLockRepository.findByStatusAndExpiresAtBefore("LOCKED", now);

        if (expiredLocks.isEmpty()) {
            return;
        }

        log.info("Found {} expired seat locks to process", expiredLocks.size());

        for (SeatLock lock : expiredLocks) {
            Long showtimeId = lock.getShowtime().getId();
            Long seatId = lock.getSeat().getId();

            // Check if seat is still active in Redis
            boolean stillInRedis = redisSeatLockService.isSeatLocked(showtimeId, seatId);
            if (!stillInRedis) {
                lock.setStatus("EXPIRED");
                seatLockRepository.save(lock);

                // Check if this seat was eventually confirmed in a booking
                boolean isConfirmed = !bookingSeatRepository.findExistingBookedSeats(
                        showtimeId,
                        Collections.singletonList(seatId),
                        CONFIRMED_STATUSES
                ).isEmpty();

                if (!isConfirmed) {
                    // Release any leftover Redis lock and broadcast WebSocket event
                    redisSeatLockService.releaseSeatLocks(showtimeId, Collections.singletonList(seatId));
                    seatWebSocketService.broadcastSeatReleased(showtimeId, Collections.singletonList(seatId));
                    log.info("Released expired seat lock for showtime {} and seat {}", showtimeId, seatId);
                }
            }
        }
    }
}
