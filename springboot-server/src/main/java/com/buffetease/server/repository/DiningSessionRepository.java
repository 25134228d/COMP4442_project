package com.buffetease.server.repository;

import com.buffetease.server.domain.DiningSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiningSessionRepository extends JpaRepository<DiningSessionEntity, String> {
    List<DiningSessionEntity> findByPackageId(String packageId);

    List<DiningSessionEntity> findByPackageIdAndSessionDate(String packageId, String sessionDate);
}
