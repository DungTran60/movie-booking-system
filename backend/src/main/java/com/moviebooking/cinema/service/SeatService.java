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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SeatService {

    private final SeatRepository seatRepository;
    private final RoomRepository roomRepository;
    private final SeatMapper seatMapper;

    private Room getRoomOrThrow(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Room not found with id: " + roomId));
    }

    @Transactional
    public List<SeatResponse> generateSeats(Long roomId, GenerateSeatsRequest request) {
        Room room = getRoomOrThrow(roomId);

        // Delete existing seats for this room to generate new layout
        seatRepository.deleteByRoomId(roomId);

        List<Seat> generatedSeats = new ArrayList<>();
        int rowCount = request.getRowCount();
        int colsPerRow = request.getColsPerRow();

        for (int r = 0; r < rowCount; r++) {
            String rowCode = String.valueOf((char) ('A' + r));
            int rowNumber = r + 1;

            for (int c = 1; c <= colsPerRow; c++) {
                String seatType = "STANDARD";

                if (Boolean.TRUE.equals(request.getCoupleRowLast()) && rowNumber == rowCount) {
                    seatType = "COUPLE";
                } else if (request.getVipRowStart() != null && request.getVipRowEnd() != null
                        && rowNumber >= request.getVipRowStart() && rowNumber <= request.getVipRowEnd()) {
                    seatType = "VIP";
                }

                Seat seat = Seat.builder()
                        .room(room)
                        .rowCode(rowCode)
                        .seatNumber(c)
                        .seatType(seatType)
                        .status("ACTIVE")
                        .build();

                generatedSeats.add(seat);
            }
        }

        List<Seat> savedSeats = seatRepository.saveAll(generatedSeats);

        // Update total seats in room entity
        room.setTotalSeats(savedSeats.size());
        roomRepository.save(room);

        return savedSeats.stream()
                .map(seatMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SeatResponse> getSeatsByRoomId(Long roomId) {
        getRoomOrThrow(roomId);
        return seatRepository.findByRoomId(roomId).stream()
                .map(seatMapper::toResponse)
                .toList();
    }
}
