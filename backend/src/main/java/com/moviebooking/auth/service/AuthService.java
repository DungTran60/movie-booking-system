package com.moviebooking.auth.service;

import com.moviebooking.auth.dto.AuthResponse;
import com.moviebooking.auth.dto.LoginRequest;
import com.moviebooking.auth.dto.RegisterRequest;
import com.moviebooking.auth.repository.RefreshTokenRepository;
import com.moviebooking.auth.repository.RoleRepository;
import com.moviebooking.auth.repository.TenantRepository;
import com.moviebooking.auth.repository.UserRepository;
import com.moviebooking.common.dto.response.ErrorCode;
import com.moviebooking.common.dto.response.UserResponse;
import com.moviebooking.common.entity.RefreshToken;
import com.moviebooking.common.entity.Role;
import com.moviebooking.common.entity.Tenant;
import com.moviebooking.common.entity.User;
import com.moviebooking.common.entity.UserRole;
import com.moviebooking.common.entity.UserRoleId;
import com.moviebooking.common.exception.AppException;
import com.moviebooking.common.mapper.UserMapper;
import com.moviebooking.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TenantRepository tenantRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Email is already in use");
        }
        if (request.getPhone() != null && !request.getPhone().isBlank() && userRepository.existsByPhone(request.getPhone())) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Phone number is already in use");
        }

        Tenant tenant = tenantRepository.findByCode("SYSTEM")
                .orElseThrow(() -> new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Default tenant not found"));

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .tenant(tenant)
                .status("ACTIVE")
                .build();
        User savedUser = userRepository.save(user);

        Role role = roleRepository.findByName("CUSTOMER")
                .orElseThrow(() -> new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Default CUSTOMER role not found"));

        UserRole userRole = UserRole.builder()
                .id(new UserRoleId(savedUser.getId(), role.getId()))
                .user(savedUser)
                .role(role)
                .build();

        savedUser.getUserRoles().add(userRole);
        User updatedUser = userRepository.save(savedUser);

        return userMapper.toResponse(updatedUser);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (Exception e) {
            throw new AppException(ErrorCode.AUTH_INVALID_CREDENTIALS, "Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.AUTH_INVALID_CREDENTIALS, "Invalid email or password"));

        String roleName = user.getUserRoles().stream()
                .map(ur -> ur.getRole().getName())
                .findFirst()
                .orElse("CUSTOMER");

        String tokenFamilyId = UUID.randomUUID().toString();

        String accessToken = jwtService.generateAccessToken(user.getId(), roleName, user.getTenant().getId());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), tokenFamilyId);

        String hashedRefreshToken = passwordEncoder.encode(refreshToken);
        LocalDateTime expiresAt = LocalDateTime.now().plus(Duration.ofMillis(jwtService.getRefreshExpiration()));

        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .user(user)
                .tokenHash(hashedRefreshToken)
                .tokenFamilyId(tokenFamilyId)
                .status("ACTIVE")
                .expiresAt(expiresAt)
                .build();
        refreshTokenRepository.save(refreshTokenEntity);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtService.getJwtExpiration() / 1000)
                .build();
    }
}
