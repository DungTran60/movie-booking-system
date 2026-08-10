package com.moviebooking.showtime.service;

import com.moviebooking.audit.service.AuditService;
import com.moviebooking.auth.repository.TenantRepository;
import com.moviebooking.cinema.entity.Room;
import com.moviebooking.cinema.entity.Seat;
import com.moviebooking.cinema.repository.RoomRepository;
import com.moviebooking.cinema.repository.SeatRepository;
import com.moviebooking.common.dto.response.ErrorCode;
import com.moviebooking.common.entity.Tenant;
import com.moviebooking.common.entity.User;
import com.moviebooking.common.exception.AppException;
import com.moviebooking.movie.entity.Movie;
import com.moviebooking.movie.repository.MovieRepository;
import com.moviebooking.showtime.dto.CreateShowtimeRequest;
import com.moviebooking.showtime.dto.ShowtimeResponse;
import com.moviebooking.showtime.dto.ShowtimeSeatResponse;
import com.moviebooking.showtime.entity.Showtime;
import com.moviebooking.showtime.mapper.ShowtimeMapper;
import com.moviebooking.showtime.repository.ShowtimeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShowtimeService {

    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final RoomRepository roomRepository;
    private final SeatRepository seatRepository;
    private final TenantRepository tenantRepository;
    private final AuditService auditService;
    private final ShowtimeMapper showtimeMapper;

    @Transactional
    public ShowtimeResponse createShowtime(CreateShowtimeRequest request, User currentUser) {
        Tenant tenant = tenantRepository.findByCode("SYSTEM")
                .orElseThrow(() -> new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Default tenant not found"));

        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Movie not found with id: " + request.getMovieId()));

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Room not found with id: " + request.getRoomId()));

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "End time must be after start time");
        }

        // BR-05 Overlap Validation Check
        List<Showtime> overlappingShowtimes = showtimeRepository.findOverlappingShowtimes(
                request.getRoomId(),
                request.getStartTime(),
                request.getEndTime()
        );

        if (!overlappingShowtimes.isEmpty()) {
            throw new AppException(ErrorCode.SHOWTIME_OVERLAP, "Showtime schedule overlaps with an existing screening in room: " + room.getName());
        }

        Showtime showtime = Showtime.builder()
                .tenant(tenant)
                .movie(movie)
                .room(room)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .price(request.getPrice())
                .status("AVAILABLE")
                .build();

        Showtime savedShowtime = showtimeRepository.save(showtime);

        auditService.logAction(
                currentUser,
                "CREATE_SHOWTIME",
                "Showtime",
                savedShowtime.getId(),
                "Created showtime for movie '" + movie.getTitle() + "' in room '" + room.getName() + "'"
        );

        return showtimeMapper.toResponse(savedShowtime);
    }

    @Transactional(readOnly = true)
    public List<ShowtimeResponse> getShowtimes(Long movieId, Long cinemaId, LocalDate date) {
        LocalDateTime startWindow = null;
        LocalDateTime endWindow = null;

        if (date != null) {
            startWindow = date.atStartOfDay();
            endWindow = date.atTime(LocalTime.MAX);
        }

        List<Showtime> showtimes = showtimeRepository.findShowtimesByFilters(movieId, cinemaId, startWindow, endWindow);
        return showtimes.stream()
                .map(showtimeMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ShowtimeSeatResponse> getShowtimeSeats(Long showtimeId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Showtime not found with id: " + showtimeId));

        List<Seat> seats = seatRepository.findByRoomId(showtime.getRoom().getId());
        BigDecimal basePrice = showtime.getPrice();

        return seats.stream().map(seat -> {
            BigDecimal seatPrice = basePrice;
            if ("VIP".equalsIgnoreCase(seat.getSeatType())) {
                seatPrice = basePrice.multiply(BigDecimal.valueOf(1.2));
            } else if ("COUPLE".equalsIgnoreCase(seat.getSeatType())) {
                seatPrice = basePrice.multiply(BigDecimal.valueOf(1.5));
            }

            return ShowtimeSeatResponse.builder()
                    .id(seat.getId())
                    .seatId(seat.getId())
                    .rowCode(seat.getRowCode())
                    .seatNumber(seat.getSeatNumber())
                    .seatType(seat.getSeatType())
                    .price(seatPrice)
                    .status("AVAILABLE") // Real-time status default AVAILABLE
                    .build();
        }).toList();
    }
}
