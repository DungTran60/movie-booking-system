package com.moviebooking.cinema.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GenerateSeatsRequest {

    @NotNull(message = "Number of rows is required")
    @Min(value = 1, message = "Row count must be at least 1")
    @Max(value = 26, message = "Row count cannot exceed 26 (A-Z)")
    private Integer rowCount;

    @NotNull(message = "Columns per row is required")
    @Min(value = 1, message = "Columns per row must be at least 1")
    @Max(value = 30, message = "Columns per row cannot exceed 30")
    private Integer colsPerRow;

    private Integer vipRowStart;
    private Integer vipRowEnd;
    private Boolean coupleRowLast = false;
}
