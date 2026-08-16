package com.moviebooking.booking.service;

import com.moviebooking.auth.repository.UserRepository;
import com.moviebooking.booking.dto.CreateBookingRequest;
import com.moviebooking.booking.dto.BookingResponse;
import com.moviebooking.booking.entity.Booking;
import com.moviebooking.booking.entity.BookingSeat;
import com.moviebooking.booking.entity.BookingStatus;
import com.moviebooking.booking.entity.SeatLock;
import com.moviebooking.booking.exception.SeatAlreadyBookedException;
import com.moviebooking.booking.exception.SeatAlreadyLockedException;
import com.moviebooking.booking.mapper.BookingMapper;
import com.moviebooking.booking.repository.BookingRepository;
import com.moviebooking.booking.repository.BookingSeatRepository;
import com.moviebooking.booking.repository.SeatLockRepository;
import com.moviebooking.cinema.entity.Seat;
import com.moviebooking.cinema.repository.SeatRepository;
import com.moviebooking.common.dto.response.ErrorCode;
import com.moviebooking.common.entity.User;
import com.moviebooking.common.exception.AppException;
import com.moviebooking.showtime.entity.Showtime;
import com.moviebooking.showtime.repository.ShowtimeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final SeatLockRepository seatLockRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final UserRepository userRepository;
    private final RedisSeatLockService redisSeatLockService;
    private final BookingMapper bookingMapper;

    private static final List<BookingStatus> ACTIVE_BOOKING_STATUSES = Arrays.asList(
            BookingStatus.PENDING,
            BookingStatus.PAYING,
            BookingStatus.CONFIRMED,
            BookingStatus.CHECKED_IN
    );

    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request, Long userId) {
        // 1. Validate Showtime existence and availability
        Showtime showtime = showtimeRepository.findById(request.getShowtimeId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Showtime not found with id: " + request.getShowtimeId()));

        if ("CANCELLED".equalsIgnoreCase(showtime.getStatus())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Showtime has been cancelled");
        }

        // 2. Validate User
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "User not found with id: " + userId));

        // 3. Validate Seats
        List<Seat> seats = seatRepository.findAllById(request.getSeatIds());
        if (seats.size() != request.getSeatIds().size()) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "One or more selected seats were not found");
        }

        // Ensure seats belong to showtime's room
        for (Seat seat : seats) {
            if (!seat.getRoom().getId().equals(showtime.getRoom().getId())) {
                throw new AppException(ErrorCode.VALIDATION_ERROR, "Seat " + seat.getId() + " does not belong to room " + showtime.getRoom().getId());
            }
        }

        // 4. Check Layer 2 DB: Are seats already booked?
        List<BookingSeat> existingBookings = bookingSeatRepository.findExistingBookedSeats(
                showtime.getId(),
                request.getSeatIds(),
                ACTIVE_BOOKING_STATUSES
        );

        if (!existingBookings.isEmpty()) {
            List<Long> bookedSeatIds = existingBookings.stream()
                    .map(bs -> bs.getSeat() != null ? bs.getSeat().getId() : null)
                    .filter(Objects::nonNull)
                    .toList();
            log.warn("Seats already booked in DB: {}", bookedSeatIds);
            throw new SeatAlreadyBookedException("One or more selected seats are already booked: " + bookedSeatIds);
        }

        // 5. Check Layer 1 Cache: Acquire Redis Locks (SET NX PX)
        boolean lockAcquired = redisSeatLockService.acquireSeatLocks(showtime.getId(), request.getSeatIds(), userId);
        if (!lockAcquired) {
            throw new SeatAlreadyLockedException("One or more selected seats are currently locked by another user");
        }

        // 6. Calculate Pricing
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<BookingSeat> bookingSeatsList = new ArrayList<>();

        Booking booking = Booking.builder()
                .tenant(showtime.getTenant())
                .user(user)
                .showtime(showtime)
                .status(BookingStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .build();

        for (Seat seat : seats) {
            BigDecimal seatPrice = calculateSeatPrice(showtime.getPrice(), seat.getSeatType());
            totalAmount = totalAmount.add(seatPrice);

            BookingSeat bookingSeat = BookingSeat.builder()
                    .booking(booking)
                    .seat(seat)
                    .showtime(showtime)
                    .price(seatPrice)
                    .build();

            bookingSeatsList.add(bookingSeat);
        }

        booking.setTotalAmount(totalAmount);
        booking.setBookingSeats(bookingSeatsList);

        // 7. Save Booking with DB Unique Constraint Safety
        Booking savedBooking;
        try {
            savedBooking = bookingRepository.save(booking);
        } catch (DataIntegrityViolationException ex) {
            log.error("DB Unique constraint violation on booking_seats (Double booking prevented!): {}", ex.getMessage());
            redisSeatLockService.releaseSeatLocks(showtime.getId(), request.getSeatIds());
            throw new SeatAlreadyBookedException("Seat double-booking detected and prevented by database constraints");
        }

        // 8. Create Audit Mirror Lock Entries in seat_locks table
        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(redisSeatLockService.getLockTtlSeconds());
        for (Seat seat : seats) {
            SeatLock seatLock = SeatLock.builder()
                    .showtime(showtime)
                    .seat(seat)
                    .user(user)
                    .expiresAt(expiresAt)
                    .status("LOCKED")
                    .build();
            seatLockRepository.save(seatLock);
        }

        return bookingMapper.toResponse(savedBooking, expiresAt);
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingDetails(Long bookingId, Long userId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Booking not found with id: " + bookingId));

        if (!isAdmin && !booking.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "Access denied: You can only view your own bookings");
        }

        LocalDateTime expiresAt = booking.getCreatedAt().plusSeconds(redisSeatLockService.getLockTtlSeconds());
        return bookingMapper.toResponse(booking, expiresAt);
    }

    private BigDecimal calculateSeatPrice(BigDecimal basePrice, String seatType) {
        if ("VIP".equalsIgnoreCase(seatType)) {
            return basePrice.multiply(BigDecimal.valueOf(1.20)); // +20% for VIP
        } else if ("COUPLE".equalsIgnoreCase(seatType)) {
            return basePrice.multiply(BigDecimal.valueOf(1.50)); // +50% for Couple
        }
        return basePrice;
    }
}
