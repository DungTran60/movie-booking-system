package com.moviebooking.cinema.service;

import com.moviebooking.auth.repository.TenantRepository;
import com.moviebooking.cinema.dto.request.CreateCinemaRequest;
import com.moviebooking.cinema.dto.response.CinemaResponse;
import com.moviebooking.cinema.entity.Cinema;
import com.moviebooking.cinema.mapper.CinemaMapper;
import com.moviebooking.cinema.repository.CinemaRepository;
import com.moviebooking.common.dto.response.ErrorCode;
import com.moviebooking.common.entity.Tenant;
import com.moviebooking.common.exception.AppException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CinemaServiceTest {

    @Mock
    private CinemaRepository cinemaRepository;

    @Mock
    private TenantRepository tenantRepository;

    @Mock
    private CinemaMapper cinemaMapper;

    @InjectMocks
    private CinemaService cinemaService;

    private Tenant testTenant;
    private Cinema testCinema;

    @BeforeEach
    void setUp() {
        testTenant = Tenant.builder().id(1L).code("SYSTEM").name("System Tenant").build();
        testCinema = Cinema.builder().id(100L).name("CineTicket Center").address("123 Main St").city("HCMC").status("ACTIVE").build();
    }

    @Test
    @DisplayName("Create cinema success should save and return CinemaResponse")
    void createCinema_success() {
        CreateCinemaRequest request = new CreateCinemaRequest();
        request.setName("CineTicket Center");
        request.setAddress("123 Main St");
        request.setCity("HCMC");

        CinemaResponse expectedResponse = new CinemaResponse();
        expectedResponse.setId(100L);
        expectedResponse.setName("CineTicket Center");

        when(tenantRepository.findByCode("SYSTEM")).thenReturn(Optional.of(testTenant));
        when(cinemaRepository.save(any(Cinema.class))).thenReturn(testCinema);
        when(cinemaMapper.toResponse(any(Cinema.class))).thenReturn(expectedResponse);

        CinemaResponse result = cinemaService.createCinema(request);

        assertNotNull(result);
        assertEquals(100L, result.getId());
        verify(cinemaRepository).save(any(Cinema.class));
    }

    @Test
    @DisplayName("Get cinema by ID not found should throw RESOURCE_NOT_FOUND AppException")
    void getCinemaById_notFound_throwsResourceNotFoundException() {
        when(cinemaRepository.findById(999L)).thenReturn(Optional.empty());

        AppException exception = assertThrows(AppException.class, () -> cinemaService.getCinemaById(999L));
        assertEquals(ErrorCode.RESOURCE_NOT_FOUND, exception.getErrorCode());
        assertTrue(exception.getMessage().contains("Cinema not found with id: 999"));
    }
}
