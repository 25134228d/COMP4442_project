package com.comp4442.backend.reservation;

import com.comp4442.backend.common.ApiException;
import com.comp4442.backend.common.ApiModels.CreateReservationRequest;
import com.comp4442.backend.common.Enums.ReservationStatus;
import com.comp4442.backend.common.Enums.SessionStatus;
import com.comp4442.backend.session.DiningSessionEntity;
import com.comp4442.backend.session.DiningSessionRepository;
import com.comp4442.backend.user.UserEntity;
import com.comp4442.backend.user.UserService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReservationService {
    private final ReservationRepository reservationRepository;
    private final DiningSessionRepository sessionRepository;
    private final UserService userService;

    public ReservationService(ReservationRepository reservationRepository, DiningSessionRepository sessionRepository, UserService userService) {
        this.reservationRepository = reservationRepository;
        this.sessionRepository = sessionRepository;
        this.userService = userService;
    }

    public List<ReservationEntity> getMyReservations(String userId) {
        return reservationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<ReservationEntity> getAllReservations() {
        return reservationRepository.findAll();
    }

    @Transactional
    public ReservationEntity createReservation(String userId, CreateReservationRequest req) {
        UserEntity user = userService.getById(userId);
        DiningSessionEntity session = sessionRepository.findByIdForUpdate(req.sessionId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Session not found"));

        if (session.getStatus() == SessionStatus.CANCELLED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Session is cancelled");
        }

        int projected = session.getCurrentBooked() + req.guestCount();
        if (projected > session.getMaxCapacity()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Not enough capacity");
        }

        session.setCurrentBooked(projected);
        session.setStatus(projected >= session.getMaxCapacity() ? SessionStatus.FULL : SessionStatus.OPEN);

        ReservationEntity reservation = new ReservationEntity();
        reservation.setUser(user);
        reservation.setSession(session);
        reservation.setGuestCount(req.guestCount());
        reservation.setSpecialRequest(req.specialRequest());
        reservation.setStatus(ReservationStatus.PENDING);

        sessionRepository.save(session);
        return reservationRepository.save(reservation);
    }

    @Transactional
    public ReservationEntity updateStatusAsUser(String reservationId, String userId, ReservationStatus target) {
        if (target != ReservationStatus.CANCELLED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Customers can only cancel reservation");
        }
        ReservationEntity reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Reservation not found"));
        if (!reservation.getUser().getId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Not your reservation");
        }
        return applyStatus(reservation, target);
    }

    @Transactional
    public ReservationEntity updateStatusAsAdmin(String reservationId, ReservationStatus target) {
        ReservationEntity reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Reservation not found"));
        return applyStatus(reservation, target);
    }

    private ReservationEntity applyStatus(ReservationEntity reservation, ReservationStatus target) {
        ReservationStatus old = reservation.getStatus();
        if (old == target) return reservation;

        if (old != ReservationStatus.CANCELLED && target == ReservationStatus.CANCELLED) {
            DiningSessionEntity session = sessionRepository.findByIdForUpdate(reservation.getSession().getId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Session not found"));
            session.setCurrentBooked(Math.max(0, session.getCurrentBooked() - reservation.getGuestCount()));
            if (session.getStatus() == SessionStatus.FULL && session.getCurrentBooked() < session.getMaxCapacity()) {
                session.setStatus(SessionStatus.OPEN);
            }
            sessionRepository.save(session);
        }

        reservation.setStatus(target);
        return reservationRepository.save(reservation);
    }
}
