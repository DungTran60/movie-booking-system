package com.moviebooking.common.mapper;

import com.moviebooking.common.dto.response.RoleResponse;
import com.moviebooking.common.entity.Role;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    RoleResponse toResponse(Role role);
}
