package com.moviebooking.booking.service;

import com.moviebooking.auth.repository.UserRepository;
import com.moviebooking.booking.dto.CreateBookingRequest;
import com.moviebooking.booking.dto.BookingResponse;
import com.moviebooking.booking.entity.Booking;
import com.moviebooking.booking.entity.BookingSeat;
import com.moviebooking.booking.entity.BookingStatus;
import com.moviebooking.booking.exception.SeatAlreadyBookedException;
import com.moviebooking.booking.exception.SeatAlreadyLockedException;
import com.moviebooking.booking.mapper.BookingMapper;
import com.moviebooking.booking.repository.BookingRepository;
import com.moviebooking.booking.repository.BookingSeatRepository;
import com.moviebooking.booking.repository.SeatLockRepository;
import com.moviebooking.cinema.entity.Room;
import com.moviebooking.cinema.entity.Seat;
import com.moviebooking.cinema.repository.SeatRepository;
import com.moviebooking.common.entity.Tenant;
import com.moviebooking.common.entity.User;
import com.moviebooking.common.exception.AppException;
import com.moviebooking.showtime.entity.Showtime;
import com.moviebooking.showtime.repository.ShowtimeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BookingSeatRepository bookingSeatRepository;

    @Mock
    private SeatLockRepository seatLockRepository;

    @Mock
    private ShowtimeRepository showtimeRepository;

    @Mock
    private SeatRepository seatRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RedisSeatLockService redisSeatLockService;

    @Mock
    private BookingMapper bookingMapper;

    @InjectMocks
    private BookingService bookingService;

    private User user;
    private Showtime showtime;
    private Seat seat1;
    private CreateBookingRequest createBookingRequest;

    @BeforeEach
    void setUp() {
        Tenant tenant = Tenant.builder().id(1L).name("Default Tenant").build();

        user = User.builder().id(100L).email("customer@moviebooking.com").tenant(tenant).build();

        Room room = Room.builder().id(5L).name("Room 01").build();

        showtime = Showtime.builder()
                .id(10L)
                .tenant(tenant)
                .room(room)
                .price(BigDecimal.valueOf(100000))
                .status("AVAILABLE")
                .startTime(LocalDateTime.now().plusHours(2))
                .endTime(LocalDateTime.now().plusHours(4))
                .build();

        seat1 = Seat.builder().id(50L).room(room).rowCode("A").seatNumber(1).seatType("STANDARD").build();

        createBookingRequest = CreateBookingRequest.builder()
                .showtimeId(10L)
                .seatIds(List.of(50L))
                .build();
    }

    @Test
    @DisplayName("Create booking successfully when seats are free and Redis lock is acquired")
    void createBooking_Success() {
        when(showtimeRepository.findById(10L)).thenReturn(Optional.of(showtime));
        when(userRepository.findById(100L)).thenReturn(Optional.of(user));
        when(seatRepository.findAllById(List.of(50L))).thenReturn(List.of(seat1));
        when(bookingSeatRepository.findExistingBookedSeats(eq(10L), eq(List.of(50L)), anyList())).thenReturn(Collections.emptyList());
        when(redisSeatLockService.acquireSeatLocks(10L, List.of(50L), 100L)).thenReturn(true);
        when(redisSeatLockService.getLockTtlSeconds()).thenReturn(300L);

        Booking savedBooking = Booking.builder()
                .id(1L)
                .user(user)
                .showtime(showtime)
                .status(BookingStatus.PENDING)
                .totalAmount(BigDecimal.valueOf(100000))
                .build();

        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);
        when(bookingMapper.toResponse(eq(savedBooking), any())).thenReturn(BookingResponse.builder().id(1L).status(BookingStatus.PENDING).build());

        BookingResponse response = bookingService.createBooking(createBookingRequest, 100L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals(BookingStatus.PENDING, response.getStatus());

        verify(bookingRepository, times(1)).save(any(Booking.class));
        verify(seatLockRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Throw SeatAlreadyBookedException when seats are already booked in DB")
    void createBooking_AlreadyBookedInDb() {
        when(showtimeRepository.findById(10L)).thenReturn(Optional.of(showtime));
        when(userRepository.findById(100L)).thenReturn(Optional.of(user));
        when(seatRepository.findAllById(List.of(50L))).thenReturn(List.of(seat1));

        BookingSeat existingSeat = BookingSeat.builder().seat(seat1).showtime(showtime).build();
        when(bookingSeatRepository.findExistingBookedSeats(eq(10L), eq(List.of(50L)), anyList()))
                .thenReturn(List.of(existingSeat));

        assertThrows(SeatAlreadyBookedException.class, () -> bookingService.createBooking(createBookingRequest, 100L));

        verify(redisSeatLockService, never()).acquireSeatLocks(anyLong(), anyList(), anyLong());
    }

    @Test
    @DisplayName("Throw SeatAlreadyLockedException when Redis lock acquisition fails")
    void createBooking_RedisLockFailed() {
        when(showtimeRepository.findById(10L)).thenReturn(Optional.of(showtime));
        when(userRepository.findById(100L)).thenReturn(Optional.of(user));
        when(seatRepository.findAllById(List.of(50L))).thenReturn(List.of(seat1));
        when(bookingSeatRepository.findExistingBookedSeats(eq(10L), eq(List.of(50L)), anyList())).thenReturn(Collections.emptyList());
        when(redisSeatLockService.acquireSeatLocks(10L, List.of(50L), 100L)).thenReturn(false);

        assertThrows(SeatAlreadyLockedException.class, () -> bookingService.createBooking(createBookingRequest, 100L));

        verify(bookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("Rollback Redis lock and throw SeatAlreadyBookedException when DB unique constraint fails")
    void createBooking_DbUniqueConstraintViolation() {
        when(showtimeRepository.findById(10L)).thenReturn(Optional.of(showtime));
        when(userRepository.findById(100L)).thenReturn(Optional.of(user));
        when(seatRepository.findAllById(List.of(50L))).thenReturn(List.of(seat1));
        when(bookingSeatRepository.findExistingBookedSeats(eq(10L), eq(List.of(50L)), anyList())).thenReturn(Collections.emptyList());
        when(redisSeatLockService.acquireSeatLocks(10L, List.of(50L), 100L)).thenReturn(true);
        when(bookingRepository.save(any(Booking.class))).thenThrow(new DataIntegrityViolationException("Unique constraint violation"));

        assertThrows(SeatAlreadyBookedException.class, () -> bookingService.createBooking(createBookingRequest, 100L));

        verify(redisSeatLockService, times(1)).releaseSeatLocks(10L, List.of(50L));
    }

    @Test
    @DisplayName("Get booking details successfully for booking owner")
    void getBookingDetails_Success_Owner() {
        Booking booking = Booking.builder()
                .id(1L)
                .user(user)
                .showtime(showtime)
                .createdAt(LocalDateTime.now())
                .build();

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingMapper.toResponse(eq(booking), any())).thenReturn(BookingResponse.builder().id(1L).userId(100L).build());

        BookingResponse response = bookingService.getBookingDetails(1L, 100L, false);

        assertNotNull(response);
        assertEquals(1L, response.getId());
    }

    @Test
    @DisplayName("Throw AppException FORBIDDEN when user tries to view another user's booking")
    void getBookingDetails_Forbidden_NotOwner() {
        Booking booking = Booking.builder()
                .id(1L)
                .user(user)
                .showtime(showtime)
                .createdAt(LocalDateTime.now())
                .build();

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        assertThrows(AppException.class, () -> bookingService.getBookingDetails(1L, 200L, false));
    }
}
