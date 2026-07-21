package com.moviebooking.common.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse<T> {
    private String status;
    private ErrorCode code;
    private String message;
    private T data;
    private List<ValidationError> errors;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ValidationError {
        private String field;
        private String message;
    }

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .status("SUCCESS")
                .code(ErrorCode.SUCCESS)
                .message("Operation completed successfully")
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .status("SUCCESS")
                .code(ErrorCode.SUCCESS)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> error(ErrorCode code, String message) {
        return ApiResponse.<T>builder()
                .status("ERROR")
                .code(code)
                .message(message)
                .build();
    }

    public static <T> ApiResponse<T> error(ErrorCode code, String message, List<ValidationError> errors) {
        return ApiResponse.<T>builder()
                .status("ERROR")
                .code(code)
                .message(message)
                .errors(errors)
                .build();
    }
}
