package com.moviebooking.booking.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SeatWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatEvent {
        private String eventType;
        private Long showtimeId;
        private List<Long> seatIds;
        private LocalDateTime timestamp;
    }

    /**
     * Broadcasts a SEAT_RELEASED event to subscribers of the showtime topic.
     * Topic destination: /topic/showtimes/{showtimeId}/seats
     */
    public void broadcastSeatReleased(Long showtimeId, List<Long> seatIds) {
        if (seatIds == null || seatIds.isEmpty()) {
            return;
        }
        SeatEvent event = SeatEvent.builder()
                .eventType("SEAT_RELEASED")
                .showtimeId(showtimeId)
                .seatIds(seatIds)
                .timestamp(LocalDateTime.now())
                .build();

        String destination = "/topic/showtimes/" + showtimeId + "/seats";
        log.info("Broadcasting SEAT_RELEASED event to {}: {}", destination, seatIds);
        messagingTemplate.convertAndSend(destination, event);
    }
}
