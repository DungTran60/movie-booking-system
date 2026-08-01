package com.moviebooking.cinema.service;

import com.moviebooking.auth.repository.TenantRepository;
import com.moviebooking.cinema.dto.request.CreateCinemaRequest;
import com.moviebooking.cinema.dto.request.UpdateCinemaRequest;
import com.moviebooking.cinema.dto.response.CinemaResponse;
import com.moviebooking.cinema.entity.Cinema;
import com.moviebooking.cinema.mapper.CinemaMapper;
import com.moviebooking.cinema.repository.CinemaRepository;
import com.moviebooking.common.dto.response.ErrorCode;
import com.moviebooking.common.entity.Tenant;
import com.moviebooking.common.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CinemaService {

    private final CinemaRepository cinemaRepository;
    private final TenantRepository tenantRepository;
    private final CinemaMapper cinemaMapper;

    @Transactional
    public CinemaResponse createCinema(CreateCinemaRequest request) {
        Tenant tenant = tenantRepository.findByCode("SYSTEM")
                .orElseThrow(() -> new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Default tenant not found"));

        Cinema cinema = Cinema.builder()
                .tenant(tenant)
                .name(request.getName().trim())
                .address(request.getAddress().trim())
                .city(request.getCity() != null ? request.getCity().trim() : null)
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .build();

        Cinema savedCinema = cinemaRepository.save(cinema);
        return cinemaMapper.toResponse(savedCinema);
    }

    @Transactional(readOnly = true)
    public CinemaResponse getCinemaById(Long id) {
        Cinema cinema = cinemaRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Cinema not found with id: " + id));

        return cinemaMapper.toResponse(cinema);
    }

    @Transactional(readOnly = true)
    public List<CinemaResponse> getAllCinemas() {
        return cinemaRepository.findAll().stream()
                .map(cinemaMapper::toResponse)
                .toList();
    }

    @Transactional
    public CinemaResponse updateCinema(Long id, UpdateCinemaRequest request) {
        Cinema cinema = cinemaRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Cinema not found with id: " + id));

        cinema.setName(request.getName().trim());
        cinema.setAddress(request.getAddress().trim());
        if (request.getCity() != null) {
            cinema.setCity(request.getCity().trim());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            cinema.setStatus(request.getStatus());
        }

        Cinema updatedCinema = cinemaRepository.save(cinema);
        return cinemaMapper.toResponse(updatedCinema);
    }

    @Transactional
    public void deleteCinema(Long id) {
        Cinema cinema = cinemaRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Cinema not found with id: " + id));

        cinema.setStatus("INACTIVE");
        cinemaRepository.save(cinema);
    }
}
