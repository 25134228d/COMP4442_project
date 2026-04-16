package com.buffetease.server.controller;

import com.buffetease.server.domain.ReservationEntity;
import com.buffetease.server.dto.ReservationStatusRequest;
import com.buffetease.server.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping
    public List<ReservationEntity> getAllReservations() {
        return reservationService.getAllReservations();
    }

    @GetMapping("/user/{userId}")
    public List<ReservationEntity> getMyReservations(@PathVariable String userId) {
        return reservationService.getReservationsByUser(userId);
    }

    @PostMapping
    public ReservationEntity createReservation(@RequestBody ReservationEntity request) {
        return reservationService.createReservation(request);
    }

    @PatchMapping("/{id}/status")
    public ReservationEntity updateReservationStatus(
            @PathVariable String id,
            @RequestBody @Valid ReservationStatusRequest request) {
        return reservationService.updateReservationStatus(id, request.status());
    }
}
