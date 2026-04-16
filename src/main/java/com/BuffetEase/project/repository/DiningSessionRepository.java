package com.BuffetEase.project.repository;

import com.BuffetEase.project.entity.DiningSession;
import com.BuffetEase.project.entity.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface DiningSessionRepository extends JpaRepository<DiningSession, String> {
    List<DiningSession> findByPackageId(String packageId);
    List<DiningSession> findBySessionDate(LocalDate sessionDate);
    List<DiningSession> findByPackageIdAndSessionDate(String packageId, LocalDate sessionDate);
    List<DiningSession> findByStatus(SessionStatus status);
    List<DiningSession> findByPackageIdAndSessionDateGreaterThanEqual(String packageId, LocalDate sessionDate);
}