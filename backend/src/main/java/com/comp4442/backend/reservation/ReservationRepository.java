package com.comp4442.backend.reservation;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationRepository extends JpaRepository<ReservationEntity, String> {
    List<ReservationEntity> findByUserIdOrderByCreatedAtDesc(String userId);
}
