package com.buffetease.server.repository;

import com.buffetease.server.domain.ReservationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReservationRepository extends JpaRepository<ReservationEntity, String> {
    List<ReservationEntity> findByUserId(String userId);
}
