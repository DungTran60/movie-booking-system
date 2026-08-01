package com.moviebooking.cinema.service;

import com.moviebooking.cinema.dto.request.CreateRoomRequest;
import com.moviebooking.cinema.dto.request.UpdateRoomRequest;
import com.moviebooking.cinema.dto.response.RoomResponse;
import com.moviebooking.cinema.entity.Cinema;
import com.moviebooking.cinema.entity.Room;
import com.moviebooking.cinema.mapper.RoomMapper;
import com.moviebooking.cinema.repository.CinemaRepository;
import com.moviebooking.cinema.repository.RoomRepository;
import com.moviebooking.common.dto.response.ErrorCode;
import com.moviebooking.common.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final CinemaRepository cinemaRepository;
    private final RoomMapper roomMapper;

    private Cinema getCinemaOrThrow(Long cinemaId) {
        return cinemaRepository.findById(cinemaId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Cinema not found with id: " + cinemaId));
    }

    @Transactional
    public RoomResponse createRoom(Long cinemaId, CreateRoomRequest request) {
        Cinema cinema = getCinemaOrThrow(cinemaId);

        String roomName = request.getName().trim();
        if (roomRepository.existsByCinemaIdAndName(cinemaId, roomName)) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Room with name '" + roomName + "' already exists in this cinema");
        }

        Room room = Room.builder()
                .cinema(cinema)
                .name(roomName)
                .totalSeats(request.getTotalSeats())
                .build();

        Room savedRoom = roomRepository.save(room);
        return roomMapper.toResponse(savedRoom);
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> getRoomsByCinemaId(Long cinemaId) {
        getCinemaOrThrow(cinemaId);
        return roomRepository.findByCinemaId(cinemaId).stream()
                .map(roomMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public RoomResponse getRoomById(Long cinemaId, Long roomId) {
        getCinemaOrThrow(cinemaId);
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Room not found with id: " + roomId));

        if (!room.getCinema().getId().equals(cinemaId)) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Room id " + roomId + " does not belong to cinema id " + cinemaId);
        }

        return roomMapper.toResponse(room);
    }

    @Transactional
    public RoomResponse updateRoom(Long cinemaId, Long roomId, UpdateRoomRequest request) {
        getCinemaOrThrow(cinemaId);

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Room not found with id: " + roomId));

        if (!room.getCinema().getId().equals(cinemaId)) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Room id " + roomId + " does not belong to cinema id " + cinemaId);
        }

        String roomName = request.getName().trim();
        if (roomRepository.existsByCinemaIdAndNameAndIdNot(cinemaId, roomName, roomId)) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Room with name '" + roomName + "' already exists in this cinema");
        }

        room.setName(roomName);
        room.setTotalSeats(request.getTotalSeats());

        Room updatedRoom = roomRepository.save(room);
        return roomMapper.toResponse(updatedRoom);
    }

    @Transactional
    public void deleteRoom(Long cinemaId, Long roomId) {
        getCinemaOrThrow(cinemaId);

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Room not found with id: " + roomId));

        if (!room.getCinema().getId().equals(cinemaId)) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Room id " + roomId + " does not belong to cinema id " + cinemaId);
        }

        roomRepository.delete(room);
    }
}
