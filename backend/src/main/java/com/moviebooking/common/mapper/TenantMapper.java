package com.moviebooking.common.mapper;

import com.moviebooking.common.dto.response.TenantResponse;
import com.moviebooking.common.entity.Tenant;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TenantMapper {

    TenantResponse toResponse(Tenant tenant);
}
