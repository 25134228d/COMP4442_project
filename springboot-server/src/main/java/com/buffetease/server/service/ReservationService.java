package com.buffetease.server.service;

import com.buffetease.server.domain.DiningSessionEntity;
import com.buffetease.server.domain.ReservationEntity;
import com.buffetease.server.domain.ReservationStatus;
import com.buffetease.server.domain.SessionStatus;
import com.buffetease.server.repository.DiningSessionRepository;
import com.buffetease.server.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final DiningSessionRepository sessionRepository;

    public List<ReservationEntity> getAllReservations() {
        return reservationRepository.findAll();
    }

    public List<ReservationEntity> getReservationsByUser(String userId) {
        return reservationRepository.findByUserId(userId);
    }

    @Transactional
    public ReservationEntity createReservation(ReservationEntity request) {
        DiningSessionEntity session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new NotFoundException("Session not found: " + request.getSessionId()));

        if (session.getStatus() == SessionStatus.CANCELLED || session.getStatus() == SessionStatus.FULL) {
            throw new IllegalStateException("Session is not available for booking");
        }

        int nextBooked = session.getCurrentBooked() + request.getGuestCount();
        if (nextBooked > session.getMaxCapacity()) {
            throw new IllegalStateException("Session capacity exceeded");
        }

        session.setCurrentBooked(nextBooked);
        if (nextBooked >= session.getMaxCapacity()) {
            session.setStatus(SessionStatus.FULL);
        }
        sessionRepository.save(session);

        request.setId(null);
        return reservationRepository.save(request);
    }

    @Transactional
    public ReservationEntity updateReservationStatus(String id, ReservationStatus status) {
        ReservationEntity reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Reservation not found: " + id));

        ReservationStatus oldStatus = reservation.getStatus();
        reservation.setStatus(status);

        if (oldStatus != ReservationStatus.CANCELLED && status == ReservationStatus.CANCELLED) {
            DiningSessionEntity session = sessionRepository.findById(reservation.getSessionId())
                    .orElseThrow(() -> new NotFoundException("Session not found: " + reservation.getSessionId()));

            int nextBooked = Math.max(0, session.getCurrentBooked() - reservation.getGuestCount());
            session.setCurrentBooked(nextBooked);
            if (session.getStatus() == SessionStatus.FULL && nextBooked < session.getMaxCapacity()) {
                session.setStatus(SessionStatus.OPEN);
            }
            sessionRepository.save(session);
        }

        return reservationRepository.save(reservation);
    }
}
