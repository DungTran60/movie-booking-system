package com.moviebooking.cinema.service;

import com.moviebooking.cinema.dto.request.CreateRoomRequest;
import com.moviebooking.cinema.entity.Cinema;
import com.moviebooking.cinema.entity.Room;
import com.moviebooking.cinema.mapper.RoomMapper;
import com.moviebooking.cinema.repository.CinemaRepository;
import com.moviebooking.cinema.repository.RoomRepository;
import com.moviebooking.common.dto.response.ErrorCode;
import com.moviebooking.common.exception.AppException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private CinemaRepository cinemaRepository;

    @Mock
    private RoomMapper roomMapper;

    @InjectMocks
    private RoomService roomService;

    private Cinema testCinema;

    @BeforeEach
    void setUp() {
        testCinema = Cinema.builder().id(10L).name("CineTicket Landmark").build();
    }

    @Test
    @DisplayName("Create room with non-existent cinema should throw RESOURCE_NOT_FOUND AppException (404 pre-condition)")
    void createRoom_cinemaNotFound_throwsResourceNotFoundException() {
        CreateRoomRequest request = new CreateRoomRequest();
        request.setName("Room 01");
        request.setTotalSeats(50);

        when(cinemaRepository.findById(99L)).thenReturn(Optional.empty());

        AppException exception = assertThrows(AppException.class, () -> roomService.createRoom(99L, request));
        assertEquals(ErrorCode.RESOURCE_NOT_FOUND, exception.getErrorCode());
        assertTrue(exception.getMessage().contains("Cinema not found with id: 99"));

        verify(roomRepository, never()).save(any(Room.class));
    }

    @Test
    @DisplayName("Create room with duplicate name in same cinema should throw VALIDATION_ERROR AppException")
    void createRoom_duplicateName_throwsValidationError() {
        CreateRoomRequest request = new CreateRoomRequest();
        request.setName("Room 01");
        request.setTotalSeats(50);

        when(cinemaRepository.findById(10L)).thenReturn(Optional.of(testCinema));
        when(roomRepository.existsByCinemaIdAndName(10L, "Room 01")).thenReturn(true);

        AppException exception = assertThrows(AppException.class, () -> roomService.createRoom(10L, request));
        assertEquals(ErrorCode.VALIDATION_ERROR, exception.getErrorCode());
        assertTrue(exception.getMessage().contains("already exists in this cinema"));

        verify(roomRepository, never()).save(any(Room.class));
    }
}
