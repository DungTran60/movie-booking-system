package com.moviebooking.common.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

/**
 * Composite primary key for user_roles table.
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class UserRoleId implements Serializable {

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "role_id")
    private Long roleId;
}
