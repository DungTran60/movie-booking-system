package com.moviebooking.showtime.controller;

import com.moviebooking.common.dto.response.ApiResponse;
import com.moviebooking.showtime.dto.ShowtimeResponse;
import com.moviebooking.showtime.dto.ShowtimeSeatResponse;
import com.moviebooking.showtime.service.ShowtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/showtimes")
@RequiredArgsConstructor
public class PublicShowtimeController {

    private final ShowtimeService showtimeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShowtimeResponse>>> getShowtimes(
            @RequestParam(required = false) Long movieId,
            @RequestParam(required = false) Long cinemaId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        List<ShowtimeResponse> response = showtimeService.getShowtimes(movieId, cinemaId, date);
        return ResponseEntity.ok(ApiResponse.success(response, "Showtimes retrieved successfully"));
    }

    @GetMapping("/{id}/seats")
    public ResponseEntity<ApiResponse<List<ShowtimeSeatResponse>>> getShowtimeSeats(@PathVariable("id") Long id) {
        List<ShowtimeSeatResponse> response = showtimeService.getShowtimeSeats(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Showtime seat layout retrieved successfully"));
    }
}
