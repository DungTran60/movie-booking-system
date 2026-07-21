package com.moviebooking.common.dto.response;

/**
 * Standardized error codes for the API response envelope.
 */
public enum ErrorCode {
    SUCCESS,
    VALIDATION_ERROR,
    AUTH_INVALID_CREDENTIALS,
    DUPLICATE_EMAIL,
    INTERNAL_SERVER_ERROR
}
