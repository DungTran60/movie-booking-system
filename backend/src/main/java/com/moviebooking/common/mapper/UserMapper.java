package com.moviebooking.common.mapper;

import com.moviebooking.common.dto.response.UserResponse;
import com.moviebooking.common.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    /**
     * Maps User entity to UserResponse DTO.
     * tenant.id   -> tenantId
     * tenant.name -> tenantName
     * password field is NOT mapped (intentionally excluded).
     */
    @Mapping(source = "tenant.id",   target = "tenantId")
    @Mapping(source = "tenant.name", target = "tenantName")
    UserResponse toResponse(User user);
}
