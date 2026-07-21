package com.moviebooking.common.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TenantResponse {

    private Long id;
    private String name;
    private String code;
    private String status;
}
