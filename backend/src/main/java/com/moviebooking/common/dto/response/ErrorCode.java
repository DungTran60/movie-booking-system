package com.moviebooking.common.dto.response;

/**
 * Standardized error codes for the API response envelope catalog.
 */
public enum ErrorCode {
    SUCCESS,
    VALIDATION_ERROR,
    AUTH_INVALID_CREDENTIALS,
    AUTH_TOKEN_EXPIRED,
    AUTH_REFRESH_REUSED,
    AUTH_REFRESH_INVALID,
    RATE_LIMIT_EXCEEDED,
    UNAUTHORIZED,
    FORBIDDEN,
    DUPLICATE_EMAIL,
    INTERNAL_SERVER_ERROR
}
