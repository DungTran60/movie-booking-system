package com.moviebooking.cinema.repository;

import com.moviebooking.cinema.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByCinemaId(Long cinemaId);
}
