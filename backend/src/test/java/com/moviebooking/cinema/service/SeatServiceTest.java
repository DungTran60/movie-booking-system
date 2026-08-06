package com.moviebooking.cinema.service;

import com.moviebooking.cinema.dto.request.GenerateSeatsRequest;
import com.moviebooking.cinema.dto.response.SeatResponse;
import com.moviebooking.cinema.entity.Room;
import com.moviebooking.cinema.entity.Seat;
import com.moviebooking.cinema.mapper.SeatMapper;
import com.moviebooking.cinema.repository.RoomRepository;
import com.moviebooking.cinema.repository.SeatRepository;
import com.moviebooking.common.dto.response.ErrorCode;
import com.moviebooking.common.exception.AppException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SeatServiceTest {

    @Mock
    private SeatRepository seatRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private SeatMapper seatMapper;

    @InjectMocks
    private SeatService seatService;

    private Room testRoom;

    @BeforeEach
    void setUp() {
        testRoom = Room.builder().id(50L).name("IMAX Hall 1").totalSeats(0).build();
    }

    @Test
    @DisplayName("Generate seats for non-existent room should throw RESOURCE_NOT_FOUND AppException (404 pre-condition)")
    void generateSeats_roomNotFound_throwsResourceNotFoundException() {
        GenerateSeatsRequest request = new GenerateSeatsRequest();
        request.setRowCount(5);
        request.setColsPerRow(10);

        when(roomRepository.findById(999L)).thenReturn(Optional.empty());

        AppException exception = assertThrows(AppException.class, () -> seatService.generateSeats(999L, request));
        assertEquals(ErrorCode.RESOURCE_NOT_FOUND, exception.getErrorCode());
        assertTrue(exception.getMessage().contains("Room not found with id: 999"));
    }

    @Test
    @DisplayName("Generate seats success should create correct row codes, seat numbers, VIP/COUPLE seat types and update room totalSeats")
    void generateSeats_success_createsCorrectLayoutAndSeatTypes() {
        GenerateSeatsRequest request = new GenerateSeatsRequest();
        request.setRowCount(3);
        request.setColsPerRow(5);
        request.setVipRowStart(2);
        request.setVipRowEnd(2);
        request.setCoupleRowLast(true);

        when(roomRepository.findById(50L)).thenReturn(Optional.of(testRoom));
        when(seatRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));
        when(seatMapper.toResponse(any(Seat.class))).thenAnswer(invocation -> {
            Seat s = invocation.getArgument(0);
            return SeatResponse.builder()
                    .id(1L)
                    .roomId(50L)
                    .rowCode(s.getRowCode())
                    .seatNumber(s.getSeatNumber())
                    .seatType(s.getSeatType())
                    .status(s.getStatus())
                    .build();
        });

        List<SeatResponse> result = seatService.generateSeats(50L, request);

        assertNotNull(result);
        assertEquals(15, result.size()); // 3 rows * 5 cols

        // Row A: STANDARD
        assertEquals("A", result.get(0).getRowCode());
        assertEquals("STANDARD", result.get(0).getSeatType());

        // Row B: VIP (row 2)
        assertEquals("B", result.get(5).getRowCode());
        assertEquals("VIP", result.get(5).getSeatType());

        // Row C: COUPLE (last row 3)
        assertEquals("C", result.get(10).getRowCode());
        assertEquals("COUPLE", result.get(10).getSeatType());

        verify(seatRepository).deleteByRoomId(50L);
        verify(seatRepository).saveAll(anyList());
        verify(roomRepository).save(testRoom);
        assertEquals(15, testRoom.getTotalSeats());
    }
}
