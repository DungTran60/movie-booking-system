package com.moviebooking.auth.service;

import com.moviebooking.auth.dto.AuthResponse;
import com.moviebooking.auth.dto.LoginRequest;
import com.moviebooking.auth.dto.RefreshTokenRequest;
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
import com.moviebooking.common.exception.AppException;
import com.moviebooking.common.mapper.UserMapper;
import com.moviebooking.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private TenantRepository tenantRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private AuthService authService;

    private Tenant testTenant;
    private Role customerRole;
    private User testUser;

    @BeforeEach
    void setUp() {
        testTenant = Tenant.builder().id(1L).name("System").code("SYSTEM").status("ACTIVE").build();
        customerRole = Role.builder().id(2L).name("CUSTOMER").description("Customer role").build();
        testUser = User.builder()
                .id(10L)
                .email("test@example.com")
                .password("hashed_password")
                .fullName("Test User")
                .tenant(testTenant)
                .userRoles(new HashSet<>())
                .build();
    }

    @Test
    @DisplayName("Register with duplicate email should throw VALIDATION_ERROR AppException")
    void register_duplicateEmail_throwsValidationException() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("duplicate@example.com");
        request.setFullName("Duplicate User");
        request.setPassword("password123");

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        AppException exception = assertThrows(AppException.class, () -> authService.register(request));
        assertEquals(ErrorCode.VALIDATION_ERROR, exception.getErrorCode());
        assertTrue(exception.getMessage().contains("Email is already in use"));

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Register success should hash password, assign default CUSTOMER role and return UserResponse")
    void register_success_hashesPasswordAndAssignsDefaultCustomerRole() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("newuser@example.com");
        request.setFullName("New User");
        request.setPassword("plain_password");

        UserResponse mockResponse = new UserResponse();
        mockResponse.setId(10L);
        mockResponse.setEmail("newuser@example.com");

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(tenantRepository.findByCode("SYSTEM")).thenReturn(Optional.of(testTenant));
        when(passwordEncoder.encode("plain_password")).thenReturn("encoded_bcrypt_hash");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(roleRepository.findByName("CUSTOMER")).thenReturn(Optional.of(customerRole));
        when(userMapper.toResponse(any(User.class))).thenReturn(mockResponse);

        UserResponse result = authService.register(request);

        assertNotNull(result);
        assertEquals(10L, result.getId());
        verify(passwordEncoder).encode("plain_password");
        verify(roleRepository).findByName("CUSTOMER");
        verify(userRepository, times(2)).save(any(User.class));
    }

    @Test
    @DisplayName("Login success should authenticate user, generate JWT tokens with correct claims and return AuthResponse")
    void login_success_returnsAccessTokenWithClaims() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");

        UserRole userRole = UserRole.builder().user(testUser).role(customerRole).build();
        testUser.getUserRoles().add(userRole);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(null);
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(testUser));
        when(jwtService.generateAccessToken(eq(10L), eq("CUSTOMER"), eq(1L))).thenReturn("mock_access_token");
        when(jwtService.generateRefreshToken(eq(10L), anyString())).thenReturn("mock_refresh_token");
        when(jwtService.getRefreshExpiration()).thenReturn(604800000L);
        when(jwtService.getJwtExpiration()).thenReturn(900000L);

        AuthResponse result = authService.login(request);

        assertNotNull(result);
        assertEquals("mock_access_token", result.getAccessToken());
        assertEquals("mock_refresh_token", result.getRefreshToken());
        assertEquals(900L, result.getExpiresIn());

        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("Refresh token rotation should revoke old token and issue new token pair")
    void refresh_success_rotatesRefreshToken() {
        String oldRawToken = "valid_old_refresh_token";
        String familyId = UUID.randomUUID().toString();

        RefreshTokenRequest request = new RefreshTokenRequest();
        request.setRefreshToken(oldRawToken);

        RefreshToken storedToken = RefreshToken.builder()
                .id(100L)
                .user(testUser)
                .tokenFamilyId(familyId)
                .status("ACTIVE")
                .expiresAt(LocalDateTime.now().plusDays(1))
                .build();

        when(jwtService.isTokenExpired(oldRawToken)).thenReturn(false);
        when(jwtService.extractTokenFamilyId(oldRawToken)).thenReturn(familyId);
        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(storedToken));
        when(jwtService.generateAccessToken(eq(10L), anyString(), eq(1L))).thenReturn("new_access_token");
        when(jwtService.generateRefreshToken(eq(10L), eq(familyId))).thenReturn("new_refresh_token");
        when(jwtService.getRefreshExpiration()).thenReturn(604800000L);

        AuthResponse response = authService.refresh(request);

        assertNotNull(response);
        assertEquals("new_access_token", response.getAccessToken());
        assertEquals("new_refresh_token", response.getRefreshToken());
        assertEquals("REVOKED", storedToken.getStatus());

        verify(refreshTokenRepository, times(2)).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("Detecting reused REVOKED token should revoke all tokens in family and throw AUTH_REFRESH_REUSED")
    void refresh_reusedToken_revokesTokenFamilyAndThrowsReusedException() {
        String reusedRawToken = "stolen_revoked_token";
        String familyId = UUID.randomUUID().toString();

        RefreshTokenRequest request = new RefreshTokenRequest();
        request.setRefreshToken(reusedRawToken);

        RefreshToken revokedToken = RefreshToken.builder()
                .id(101L)
                .user(testUser)
                .tokenFamilyId(familyId)
                .status("REVOKED")
                .expiresAt(LocalDateTime.now().plusDays(1))
                .build();

        RefreshToken activeTokenInFamily = RefreshToken.builder()
                .id(102L)
                .user(testUser)
                .tokenFamilyId(familyId)
                .status("ACTIVE")
                .expiresAt(LocalDateTime.now().plusDays(1))
                .build();

        when(jwtService.isTokenExpired(reusedRawToken)).thenReturn(false);
        when(jwtService.extractTokenFamilyId(reusedRawToken)).thenReturn(familyId);
        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(revokedToken));
        when(refreshTokenRepository.findByTokenFamilyId(familyId)).thenReturn(List.of(revokedToken, activeTokenInFamily));

        AppException exception = assertThrows(AppException.class, () -> authService.refresh(request));

        assertEquals(ErrorCode.AUTH_REFRESH_REUSED, exception.getErrorCode());
        assertTrue(exception.getMessage().contains("Refresh token reuse detected"));
        assertEquals("REVOKED", activeTokenInFamily.getStatus());

        verify(refreshTokenRepository).saveAll(anyList());
    }
}
