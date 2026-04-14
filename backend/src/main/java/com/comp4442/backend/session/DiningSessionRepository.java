package com.comp4442.backend.session;

import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

public interface DiningSessionRepository extends JpaRepository<DiningSessionEntity, String> {
    List<DiningSessionEntity> findByBuffetPackageId(String packageId);
    List<DiningSessionEntity> findByBuffetPackageIdAndSessionDate(String packageId, LocalDate date);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from DiningSessionEntity s where s.id = :id")
    Optional<DiningSessionEntity> findByIdForUpdate(String id);
}
