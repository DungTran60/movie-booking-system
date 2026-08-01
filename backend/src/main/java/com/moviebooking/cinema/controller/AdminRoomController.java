package com.moviebooking.cinema.controller;

import com.moviebooking.cinema.dto.request.CreateRoomRequest;
import com.moviebooking.cinema.dto.request.UpdateRoomRequest;
import com.moviebooking.cinema.dto.response.RoomResponse;
import com.moviebooking.cinema.service.RoomService;
import com.moviebooking.common.dto.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/cinemas/{cinemaId}/rooms")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminRoomController {

    private final RoomService roomService;

    @PostMapping
    public ResponseEntity<ApiResponse<RoomResponse>> createRoom(
            @PathVariable Long cinemaId,
            @Valid @RequestBody CreateRoomRequest request
    ) {
        RoomResponse response = roomService.createRoom(cinemaId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Room created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoomResponse>>> getRoomsByCinemaId(@PathVariable Long cinemaId) {
        List<RoomResponse> response = roomService.getRoomsByCinemaId(cinemaId);
        return ResponseEntity.ok(ApiResponse.success(response, "Rooms retrieved successfully"));
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<ApiResponse<RoomResponse>> getRoomById(
            @PathVariable Long cinemaId,
            @PathVariable Long roomId
    ) {
        RoomResponse response = roomService.getRoomById(cinemaId, roomId);
        return ResponseEntity.ok(ApiResponse.success(response, "Room retrieved successfully"));
    }

    @PutMapping("/{roomId}")
    public ResponseEntity<ApiResponse<RoomResponse>> updateRoom(
            @PathVariable Long cinemaId,
            @PathVariable Long roomId,
            @Valid @RequestBody UpdateRoomRequest request
    ) {
        RoomResponse response = roomService.updateRoom(cinemaId, roomId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Room updated successfully"));
    }

    @DeleteMapping("/{roomId}")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(
            @PathVariable Long cinemaId,
            @PathVariable Long roomId
    ) {
        roomService.deleteRoom(cinemaId, roomId);
        return ResponseEntity.ok(ApiResponse.success(null, "Room deleted successfully"));
    }
}
