package com.moviebooking.common.exception;

import com.moviebooking.common.dto.response.ApiResponse;
import com.moviebooking.common.dto.response.ErrorCode;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.ArrayList;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        HttpStatus status = HttpStatus.BAD_REQUEST;
        if (ex.getErrorCode() == ErrorCode.AUTH_INVALID_CREDENTIALS) {
            status = HttpStatus.UNAUTHORIZED;
        }
        ApiResponse<Void> response = ApiResponse.error(ex.getErrorCode(), ex.getMessage());
        return new ResponseEntity<>(response, status);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentialsException(BadCredentialsException ex) {
        ApiResponse<Void> response = ApiResponse.error(ErrorCode.AUTH_INVALID_CREDENTIALS, "Invalid email or password");
        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        List<ApiResponse.ValidationError> errors = new ArrayList<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.add(ApiResponse.ValidationError.builder()
                    .field(fieldName)
                    .message(errorMessage)
                    .build());
        });

        ApiResponse<Void> response = ApiResponse.error(
                ErrorCode.VALIDATION_ERROR,
                "Input validation failed",
                errors
        );
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        ApiResponse<Void> response = ApiResponse.error(
                ErrorCode.INTERNAL_SERVER_ERROR,
                ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred"
        );
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
