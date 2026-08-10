package com.moviebooking.showtime.service;

import com.moviebooking.audit.service.AuditService;
import com.moviebooking.auth.repository.TenantRepository;
import com.moviebooking.cinema.entity.Cinema;
import com.moviebooking.cinema.entity.Room;
import com.moviebooking.cinema.repository.RoomRepository;
import com.moviebooking.common.dto.response.ErrorCode;
import com.moviebooking.common.entity.Tenant;
import com.moviebooking.common.entity.User;
import com.moviebooking.common.exception.AppException;
import com.moviebooking.movie.entity.Movie;
import com.moviebooking.movie.repository.MovieRepository;
import com.moviebooking.showtime.dto.CreateShowtimeRequest;
import com.moviebooking.showtime.dto.ShowtimeResponse;
import com.moviebooking.showtime.entity.Showtime;
import com.moviebooking.showtime.mapper.ShowtimeMapper;
import com.moviebooking.showtime.repository.ShowtimeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShowtimeServiceTest {

    @Mock
    private ShowtimeRepository showtimeRepository;

    @Mock
    private MovieRepository movieRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private TenantRepository tenantRepository;

    @Mock
    private AuditService auditService;

    @Mock
    private ShowtimeMapper showtimeMapper;

    @InjectMocks
    private ShowtimeService showtimeService;

    private Tenant testTenant;
    private Movie testMovie;
    private Room testRoom;
    private User testAdminUser;

    @BeforeEach
    void setUp() {
        testTenant = Tenant.builder().id(1L).code("SYSTEM").build();
        testMovie = Movie.builder().id(10L).title("Dune: Part Two").duration(165).build();
        testRoom = Room.builder().id(20L).name("IMAX Hall 1").cinema(Cinema.builder().id(5L).name("CineTicket Center").build()).build();
        testAdminUser = User.builder().id(100L).email("admin@moviebooking.com").tenant(testTenant).build();
    }

    @Test
    @DisplayName("Create showtime with non-existent movie should throw RESOURCE_NOT_FOUND AppException (404)")
    void createShowtime_movieNotFound_throwsResourceNotFoundException() {
        CreateShowtimeRequest request = new CreateShowtimeRequest();
        request.setMovieId(999L);
        request.setRoomId(20L);
        request.setStartTime(LocalDateTime.of(2026, 9, 1, 14, 0));
        request.setEndTime(LocalDateTime.of(2026, 9, 1, 16, 30));
        request.setPrice(BigDecimal.valueOf(120000));

        when(tenantRepository.findByCode("SYSTEM")).thenReturn(Optional.of(testTenant));
        when(movieRepository.findById(999L)).thenReturn(Optional.empty());

        AppException exception = assertThrows(AppException.class, () -> showtimeService.createShowtime(request, testAdminUser));
        assertEquals(ErrorCode.RESOURCE_NOT_FOUND, exception.getErrorCode());
        assertTrue(exception.getMessage().contains("Movie not found with id: 999"));
    }

    @Test
    @DisplayName("Create showtime with overlapping schedule in same room should throw SHOWTIME_OVERLAP AppException (409 Conflict - BR-05)")
    void createShowtime_overlappingSchedule_throwsShowtimeOverlapException() {
        LocalDateTime start = LocalDateTime.of(2026, 9, 1, 14, 0);
        LocalDateTime end = LocalDateTime.of(2026, 9, 1, 16, 30);

        CreateShowtimeRequest request = new CreateShowtimeRequest();
        request.setMovieId(10L);
        request.setRoomId(20L);
        request.setStartTime(start);
        request.setEndTime(end);
        request.setPrice(BigDecimal.valueOf(120000));

        Showtime existingShowtime = Showtime.builder()
                .id(1L)
                .room(testRoom)
                .startTime(LocalDateTime.of(2026, 9, 1, 15, 0))
                .endTime(LocalDateTime.of(2026, 9, 1, 17, 30))
                .build();

        when(tenantRepository.findByCode("SYSTEM")).thenReturn(Optional.of(testTenant));
        when(movieRepository.findById(10L)).thenReturn(Optional.of(testMovie));
        when(roomRepository.findById(20L)).thenReturn(Optional.of(testRoom));
        when(showtimeRepository.findOverlappingShowtimes(20L, start, end)).thenReturn(List.of(existingShowtime));

        AppException exception = assertThrows(AppException.class, () -> showtimeService.createShowtime(request, testAdminUser));
        assertEquals(ErrorCode.SHOWTIME_OVERLAP, exception.getErrorCode());
        assertTrue(exception.getMessage().contains("overlaps with an existing screening"));

        verify(showtimeRepository, never()).save(any(Showtime.class));
    }

    @Test
    @DisplayName("Create showtime success when no schedule overlap exists in same room")
    void createShowtime_success_whenNoOverlap() {
        LocalDateTime start = LocalDateTime.of(2026, 9, 1, 18, 0);
        LocalDateTime end = LocalDateTime.of(2026, 9, 1, 20, 30);

        CreateShowtimeRequest request = new CreateShowtimeRequest();
        request.setMovieId(10L);
        request.setRoomId(20L);
        request.setStartTime(start);
        request.setEndTime(end);
        request.setPrice(BigDecimal.valueOf(120000));

        Showtime savedShowtime = Showtime.builder()
                .id(100L)
                .tenant(testTenant)
                .movie(testMovie)
                .room(testRoom)
                .startTime(start)
                .endTime(end)
                .price(BigDecimal.valueOf(120000))
                .build();

        ShowtimeResponse expectedResponse = ShowtimeResponse.builder()
                .id(100L)
                .startTime(start)
                .endTime(end)
                .price(BigDecimal.valueOf(120000))
                .build();

        when(tenantRepository.findByCode("SYSTEM")).thenReturn(Optional.of(testTenant));
        when(movieRepository.findById(10L)).thenReturn(Optional.of(testMovie));
        when(roomRepository.findById(20L)).thenReturn(Optional.of(testRoom));
        when(showtimeRepository.findOverlappingShowtimes(20L, start, end)).thenReturn(Collections.emptyList());
        when(showtimeRepository.save(any(Showtime.class))).thenReturn(savedShowtime);
        when(showtimeMapper.toResponse(any(Showtime.class))).thenReturn(expectedResponse);

        ShowtimeResponse response = showtimeService.createShowtime(request, testAdminUser);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        verify(showtimeRepository).save(any(Showtime.class));
        verify(auditService).logAction(eq(testAdminUser), eq("CREATE_SHOWTIME"), eq("Showtime"), eq(100L), anyString());
    }
}
