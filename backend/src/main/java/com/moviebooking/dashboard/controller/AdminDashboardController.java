package com.moviebooking.dashboard.controller;

import com.moviebooking.common.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<String>> getAdminDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard stats retrieved successfully"));
    }
}
