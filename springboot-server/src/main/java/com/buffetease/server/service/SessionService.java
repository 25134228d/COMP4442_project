package com.buffetease.server.service;

import com.buffetease.server.domain.DiningSessionEntity;
import com.buffetease.server.repository.DiningSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final DiningSessionRepository sessionRepository;

    public List<DiningSessionEntity> getAllSessions() {
        return sessionRepository.findAll();
    }

    public List<DiningSessionEntity> getSessionsByPackage(String packageId, String date) {
        if (date == null || date.isBlank()) {
            return sessionRepository.findByPackageId(packageId);
        }
        return sessionRepository.findByPackageIdAndSessionDate(packageId, date);
    }

    public DiningSessionEntity createSession(DiningSessionEntity request) {
        request.setId(null);
        return sessionRepository.save(request);
    }

    public DiningSessionEntity updateSession(String id, DiningSessionEntity request) {
        DiningSessionEntity existing = sessionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Session not found: " + id));

        existing.setPackageId(request.getPackageId());
        existing.setSessionDate(request.getSessionDate());
        existing.setStartTime(request.getStartTime());
        existing.setEndTime(request.getEndTime());
        existing.setMaxCapacity(request.getMaxCapacity());
        existing.setCurrentBooked(request.getCurrentBooked());
        existing.setStatus(request.getStatus());

        return sessionRepository.save(existing);
    }
}
