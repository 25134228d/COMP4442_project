package com.buffetease.buffet_ease.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.buffetease.buffet_ease.model.Session;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    
    List<Session> findByPackageObjId(Long packageId);
    
    @Query("SELECT s FROM Session s WHERE s.packageObj.id = :packageId AND s.sessionDate >= CURRENT_DATE ORDER BY s.sessionDate ASC, s.startTime ASC")
    List<Session> findUpcomingSessionsByPackageId(@Param("packageId") Long packageId);
}
