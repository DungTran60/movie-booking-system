package com.moviebooking.ticket.controller;

import com.moviebooking.common.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/staff/tickets")
public class StaffTicketController {

    @PostMapping("/{ticketCode}/check-in")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ApiResponse<String>> checkInTicket(@PathVariable String ticketCode) {
        return ResponseEntity.ok(ApiResponse.success("Ticket " + ticketCode + " checked in successfully"));
    }
}
