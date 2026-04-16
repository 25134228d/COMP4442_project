package com.BuffetEase.project.repository;

import com.BuffetEase.project.entity.Reservation;
import com.BuffetEase.project.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, String> {
    List<Reservation> findByGuestId(String guestId);
    List<Reservation> findBySessionId(String sessionId);
    List<Reservation> findByStatus(ReservationStatus status);
}