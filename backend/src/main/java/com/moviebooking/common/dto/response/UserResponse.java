package com.moviebooking.common.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Response DTO for User — password field is intentionally excluded.
 */
@Getter
@Setter
public class UserResponse {

    private Long id;
    private Long tenantId;
    private String tenantName;
    private String fullName;
    private String email;
    private String phone;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
