package com.moviebooking.common.dto.response;

/**
 * Standardized error codes for the API response envelope.
 */
public enum ErrorCode {
    SUCCESS,
    VALIDATION_ERROR,
    AUTH_INVALID_CREDENTIALS,
    AUTH_REFRESH_REUSED,
    AUTH_REFRESH_INVALID,
    UNAUTHORIZED,
    FORBIDDEN,
    DUPLICATE_EMAIL,
    INTERNAL_SERVER_ERROR
}
