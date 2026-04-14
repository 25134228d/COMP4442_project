package com.comp4442.backend.reservation;

import com.comp4442.backend.common.ApiModels.CreateReservationRequest;
import com.comp4442.backend.common.ApiModels.UpdateReservationStatusRequest;
import com.comp4442.backend.common.Mappers;
import com.comp4442.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ReservationController {
    private final ReservationService service;

    public ReservationController(ReservationService service) {
        this.service = service;
    }

    @GetMapping("/reservations/me")
    public List<?> myReservations(@AuthenticationPrincipal UserPrincipal principal) {
        return service.getMyReservations(principal.getId()).stream().map(Mappers::toReservationDto).toList();
    }

    @PostMapping("/reservations")
    public Object create(@AuthenticationPrincipal UserPrincipal principal,
                         @Valid @RequestBody CreateReservationRequest req) {
        return Mappers.toReservationDto(service.createReservation(principal.getId(), req));
    }

    @PatchMapping("/reservations/{id}/status")
    public Object userStatus(@PathVariable String id,
                             @AuthenticationPrincipal UserPrincipal principal,
                             @Valid @RequestBody UpdateReservationStatusRequest req) {
        return Mappers.toReservationDto(service.updateStatusAsUser(id, principal.getId(), req.status()));
    }

    @GetMapping("/admin/reservations")
    public List<?> allReservations() {
        return service.getAllReservations().stream().map(Mappers::toReservationDto).toList();
    }

    @PatchMapping("/admin/reservations/{id}/status")
    public Object adminStatus(@PathVariable String id,
                              @Valid @RequestBody UpdateReservationStatusRequest req) {
        return Mappers.toReservationDto(service.updateStatusAsAdmin(id, req.status()));
    }
}
