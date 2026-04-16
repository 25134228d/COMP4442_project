package com.BuffetEase.project.controller;

import com.BuffetEase.project.entity.DiningSession;
import com.BuffetEase.project.entity.SessionStatus;
import com.BuffetEase.project.service.DiningSessionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
public class DiningSessionController {

    private final DiningSessionService diningSessionService;

    public DiningSessionController(DiningSessionService diningSessionService) {
        this.diningSessionService = diningSessionService;
    }

    @PostMapping
    public ResponseEntity<DiningSession> createSession(@RequestBody DiningSession diningSession) {
        return ResponseEntity.status(HttpStatus.CREATED).body(diningSessionService.createSession(diningSession));
    }

    @GetMapping
    public ResponseEntity<List<DiningSession>> getAllSessions() {
        return ResponseEntity.ok(diningSessionService.getAllSessions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiningSession> getSessionById(@PathVariable String id) {
        return diningSessionService.getSessionById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/package/{packageId}/available")
    public ResponseEntity<List<DiningSession>> getAvailableSessionsByPackage(@PathVariable String packageId) {
        return ResponseEntity.ok(diningSessionService.getAvailableSessionsByPackage(packageId));
    }

    @GetMapping("/package/{packageId}")
    public ResponseEntity<List<DiningSession>> getSessionsByPackage(@PathVariable String packageId) {
        return ResponseEntity.ok(diningSessionService.getSessionsByPackageId(packageId));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<DiningSession>> getSessionsByDate(@PathVariable LocalDate date) {
        return ResponseEntity.ok(diningSessionService.getSessionsByDate(date));
    }

    @GetMapping("/package/{packageId}/date/{date}")
    public ResponseEntity<List<DiningSession>> getSessionsByPackageAndDate(
            @PathVariable String packageId,
            @PathVariable LocalDate date) {
        return ResponseEntity.ok(diningSessionService.getSessionsByPackageAndDate(packageId, date));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<DiningSession>> getSessionsByStatus(@PathVariable SessionStatus status) {
        return ResponseEntity.ok(diningSessionService.getSessionsByStatus(status));
    }

    @GetMapping("/{id}/available-seats")
    public ResponseEntity<Map<String, Integer>> getAvailableSeats(@PathVariable String id) {
        return ResponseEntity.ok(Map.of("availableSeats", diningSessionService.getAvailableSeats(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiningSession> updateSession(@PathVariable String id, @RequestBody DiningSession sessionDetails) {
        try {
            return ResponseEntity.ok(diningSessionService.updateSession(id, sessionDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable String id) {
        diningSessionService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }
}