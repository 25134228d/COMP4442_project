package com.BuffetEase.project.service;

import com.BuffetEase.project.entity.Reservation;
import com.BuffetEase.project.entity.ReservationStatus;
import com.BuffetEase.project.repository.ReservationRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final DiningSessionService diningSessionService;

    public ReservationService(ReservationRepository reservationRepository, DiningSessionService diningSessionService) {
        this.reservationRepository = reservationRepository;
        this.diningSessionService = diningSessionService;
    }

    public Reservation createReservation(Reservation reservation) {
        if (reservation == null || reservation.getSessionId() == null) {
            throw new RuntimeException("Reservation and session ID are required");
        }
        if (diningSessionService.incrementBooking(reservation.getSessionId(), reservation.getGuestCount())) {
            return reservationRepository.save(reservation);
        }
        throw new RuntimeException("Unable to book - session may be full or fully booked");
    }

    public Optional<Reservation> getReservationById(String id) {
        return reservationRepository.findById(id);
    }

    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    public List<Reservation> getReservationsByGuestId(String guestId) {
        return reservationRepository.findByGuestId(guestId);
    }

    public List<Reservation> getReservationsBySessionId(String sessionId) {
        return reservationRepository.findBySessionId(sessionId);
    }

    public List<Reservation> getReservationsByStatus(ReservationStatus status) {
        return reservationRepository.findByStatus(status);
    }

    public Reservation updateReservation(String id, Reservation reservationDetails) {
        return reservationRepository.findById(id).map(reservation -> {
            if (reservation.getGuestCount() != reservationDetails.getGuestCount()) {
                int difference = reservationDetails.getGuestCount() - reservation.getGuestCount();
                if (difference > 0) {
                    if (!diningSessionService.incrementBooking(reservation.getSessionId(), difference)) {
                        throw new RuntimeException("Not enough available seats");
                    }
                } else {
                    diningSessionService.decrementBooking(reservation.getSessionId(), -difference);
                }
                reservation.setGuestCount(reservationDetails.getGuestCount());
            }
            reservation.setSpecialRequest(reservationDetails.getSpecialRequest());
            reservation.setStatus(reservationDetails.getStatus());
            return reservationRepository.save(reservation);
        }).orElseThrow(() -> new RuntimeException("Reservation not found"));
    }

    public void cancelReservation(String id) {
        Optional<Reservation> reservation = reservationRepository.findById(id);
        if (reservation.isPresent()) {
            Reservation r = reservation.get();
            if (!r.getStatus().equals(ReservationStatus.CANCELLED)) {
                r.setStatus(ReservationStatus.CANCELLED);
                diningSessionService.decrementBooking(r.getSessionId(), r.getGuestCount());
                reservationRepository.save(r);
            }
        } else {
            throw new RuntimeException("Reservation not found");
        }
    }

    public void deleteReservation(String id) {
        Optional<Reservation> reservation = reservationRepository.findById(id);
        if (reservation.isPresent()) {
            Reservation r = reservation.get();
            if (!r.getStatus().equals(ReservationStatus.CANCELLED)) {
                diningSessionService.decrementBooking(r.getSessionId(), r.getGuestCount());
            }
            reservationRepository.deleteById(id);
        } else {
            throw new RuntimeException("Reservation not found");
        }
    }
}