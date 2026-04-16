package com.BuffetEase.project.service;

import com.BuffetEase.project.entity.DiningSession;
import com.BuffetEase.project.entity.SessionStatus;
import com.BuffetEase.project.repository.DiningSessionRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class DiningSessionService {

    private final DiningSessionRepository diningSessionRepository;

    public DiningSessionService(DiningSessionRepository diningSessionRepository) {
        this.diningSessionRepository = diningSessionRepository;
    }

    public DiningSession createSession(DiningSession diningSession) {
        return diningSessionRepository.save(diningSession);
    }

    public Optional<DiningSession> getSessionById(String id) {
        return diningSessionRepository.findById(id);
    }

    public List<DiningSession> getAllSessions() {
        return diningSessionRepository.findAll();
    }

    public List<DiningSession> getSessionsByPackageId(String packageId) {
        return diningSessionRepository.findByPackageId(packageId);
    }

    public List<DiningSession> getAvailableSessionsByPackage(String packageId) {
        LocalDate today = LocalDate.now();
        return diningSessionRepository.findByPackageIdAndSessionDateGreaterThanEqual(packageId, today)
                .stream()
                .filter(session -> !session.getStatus().equals(SessionStatus.CANCELLED))
                .toList();
    }

    public List<DiningSession> getSessionsByDate(LocalDate sessionDate) {
        return diningSessionRepository.findBySessionDate(sessionDate);
    }

    public List<DiningSession> getSessionsByPackageAndDate(String packageId, LocalDate sessionDate) {
        return diningSessionRepository.findByPackageIdAndSessionDate(packageId, sessionDate);
    }

    public List<DiningSession> getSessionsByStatus(SessionStatus status) {
        return diningSessionRepository.findByStatus(status);
    }

    public DiningSession updateSession(String id, DiningSession sessionDetails) {
        return diningSessionRepository.findById(id).map(session -> {
            session.setSessionDate(sessionDetails.getSessionDate());
            session.setStartTime(sessionDetails.getStartTime());
            session.setEndTime(sessionDetails.getEndTime());
            session.setMaxCapacity(sessionDetails.getMaxCapacity());
            session.setCurrentBooked(sessionDetails.getCurrentBooked());
            // Auto-update status based on capacity
            if (session.getCurrentBooked() >= session.getMaxCapacity()) {
                session.setStatus(SessionStatus.FULL);
            } else if (!session.getStatus().equals(SessionStatus.CANCELLED)) {
                session.setStatus(SessionStatus.OPEN);
            }
            return diningSessionRepository.save(session);
        }).orElseThrow(() -> new RuntimeException("Session not found"));
    }

    public void deleteSession(String id) {
        diningSessionRepository.deleteById(id);
    }

    public boolean incrementBooking(String sessionId, int guestCount) {
        Optional<DiningSession> session = diningSessionRepository.findById(sessionId);
        if (session.isPresent()) {
            DiningSession s = session.get();
            if (s.getCurrentBooked() + guestCount <= s.getMaxCapacity()) {
                s.setCurrentBooked(s.getCurrentBooked() + guestCount);
                if (s.getCurrentBooked() >= s.getMaxCapacity()) {
                    s.setStatus(SessionStatus.FULL);
                }
                diningSessionRepository.save(s);
                return true;
            }
        }
        return false;
    }

    public boolean decrementBooking(String sessionId, int guestCount) {
        Optional<DiningSession> session = diningSessionRepository.findById(sessionId);
        if (session.isPresent()) {
            DiningSession s = session.get();
            s.setCurrentBooked(Math.max(0, s.getCurrentBooked() - guestCount));
            if (s.getCurrentBooked() < s.getMaxCapacity() && !s.getStatus().equals(SessionStatus.CANCELLED)) {
                s.setStatus(SessionStatus.OPEN);
            }
            diningSessionRepository.save(s);
            return true;
        }
        return false;
    }

    public int getAvailableSeats(String sessionId) {
        return diningSessionRepository.findById(sessionId)
                .map(session -> session.getMaxCapacity() - session.getCurrentBooked())
                .orElse(0);
    }
}