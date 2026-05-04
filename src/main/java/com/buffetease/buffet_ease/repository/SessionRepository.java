package com.buffetease.buffet_ease.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.buffetease.buffet_ease.model.Session;

/**
 * SessionRepository — data access layer for the "sessions" table.
 *
 * Extends JpaRepository<Session, Long> which provides standard CRUD operations:
 *   - findById(id)   → SELECT WHERE id = ? — used when creating a booking.
 *   - save(session)  → UPDATE the session row (e.g. to reduce availableSeats).
 *   - existsById(id) → SELECT COUNT(*) WHERE id = ?
 *
 * Additional custom query methods are defined below.
 * @Repository registers this as a Spring bean for dependency injection.
 */
@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {

    /**
     * Spring generates from the method name:
     * SELECT * FROM sessions WHERE package_id = ?
     *
     * Returns ALL sessions for a package (including past sessions).
     * Used internally; the API prefers findUpcomingSessionsByPackageId instead.
     */
    List<Session> findByPackageObjId(Long packageId);

    /**
     * Custom JPQL query (Java Persistence Query Language — similar to SQL but uses entity names).
     *
     * SELECT s FROM Session s        — select all Session entities aliased as "s"
     * WHERE s.packageObj.id = :packageId   — filter by the package's ID
     * AND s.sessionDate >= CURRENT_DATE    — only return today's or future sessions (no past dates)
     * ORDER BY s.sessionDate ASC, s.startTime ASC  — sort by date, then by time within the same date
     *
     * @Param("packageId") binds the :packageId placeholder to the method parameter.
     *
     * This is called by PackageService.getSessionsByPackageId() to populate the session
     * dropdown in the booking modal — customers should only see available future slots.
     */
    @Query("SELECT s FROM Session s WHERE s.packageObj.id = :packageId AND s.sessionDate >= CURRENT_DATE ORDER BY s.sessionDate ASC, s.startTime ASC")
    List<Session> findUpcomingSessionsByPackageId(@Param("packageId") Long packageId);
}
