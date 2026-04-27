package com.BuffetEase.cloud.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api")
public class CloudController {

    private static final String OPEN = "OPEN";

    private final Map<String, BuffetPackage> packages = new ConcurrentHashMap<>();
    private final Map<String, BuffetSession> sessions = new ConcurrentHashMap<>();
    private final List<Reservation> reservations = new CopyOnWriteArrayList<>();
    private final List<ContactMessage> contactMessages = new CopyOnWriteArrayList<>();

    public CloudController() {
        seedData();
    }

    @GetMapping("/packages/active")
    public List<BuffetPackage> getActivePackages() {
        return packages.values().stream()
                .filter(BuffetPackage::active)
                .sorted(Comparator.comparing(BuffetPackage::name))
                .toList();
    }

    @GetMapping("/packages/{id}")
    public BuffetPackage getPackageById(@PathVariable String id) {
        BuffetPackage pkg = packages.get(id);
        if (pkg == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Package not found");
        }
        return pkg;
    }

    @GetMapping("/sessions")
    public List<BuffetSession> getAllSessions() {
        return sessions.values().stream()
                .sorted(Comparator.comparing(BuffetSession::sessionDate)
                        .thenComparing(BuffetSession::startTime))
                .toList();
    }

    @GetMapping("/sessions/package/{packageId}")
    public List<BuffetSession> getSessionsByPackage(@PathVariable String packageId) {
        return sessions.values().stream()
                .filter(session -> session.packageId().equals(packageId))
                .sorted(Comparator.comparing(BuffetSession::sessionDate)
                        .thenComparing(BuffetSession::startTime))
                .toList();
    }

    @PostMapping("/reservations")
    @ResponseStatus(HttpStatus.CREATED)
    public Reservation createReservation(@RequestBody ReservationRequest request) {
        BuffetSession session = sessions.get(request.sessionId());
        if (session == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Session does not exist");
        }
        if (!OPEN.equalsIgnoreCase(session.status())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Session is not open");
        }
        if (request.guestCount() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Guest count must be at least 1");
        }

        int seatsLeft = session.maxCapacity() - session.currentBooked();
        if (request.guestCount() > seatsLeft) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not enough seats available");
        }

        Reservation reservation = new Reservation(
                "r-" + System.currentTimeMillis(),
                request.userId(),
                request.sessionId(),
                request.guestCount(),
                request.specialRequest(),
                request.status(),
                Instant.now().toString(),
                request.updatedAt());

        reservations.add(reservation);

        BuffetSession updatedSession = new BuffetSession(
                session.id(),
                session.packageId(),
                session.sessionDate(),
                session.startTime(),
                session.endTime(),
                session.maxCapacity(),
                session.currentBooked() + request.guestCount(),
                session.status());
        sessions.put(updatedSession.id(), updatedSession);

        return reservation;
    }

    @GetMapping("/reservations/user/{userId}")
    public List<Reservation> getReservationsByUser(@PathVariable String userId) {
        return reservations.stream()
                .filter(reservation -> reservation.userId().equals(userId))
                .sorted((a, b) -> b.createdAt().compareTo(a.createdAt()))
                .toList();
    }

    @PostMapping("/contact")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> submitContact(@RequestBody ContactRequest request) {
        if (request.name() == null || request.name().isBlank() ||
                request.email() == null || request.email().isBlank() ||
                request.message() == null || request.message().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "All fields are required");
        }

        contactMessages.add(new ContactMessage(
                "c-" + System.currentTimeMillis(),
                request.name().trim(),
                request.email().trim(),
                request.message().trim(),
                Instant.now().toString()));

        return Map.of("message", "Received");
    }

    private void seedData() {
        BuffetPackage p1 = new BuffetPackage(
                "p1",
                "Elegant Lunch Buffet",
                "LUNCH",
                "Fresh salads, seafood, stir-fries & desserts",
                388,
                "https://picsum.photos/seed/lunch/800/600",
                true);
        BuffetPackage p2 = new BuffetPackage(
                "p2",
                "Sunday Brunch Extravaganza",
                "BRUNCH",
                "Premium seafood, live stations & pastries",
                528,
                "https://picsum.photos/seed/brunch/800/600",
                true);
        BuffetPackage p3 = new BuffetPackage(
                "p3",
                "Premium Dinner Feast",
                "DINNER",
                "Sashimi, premium meats & international dishes",
                688,
                "https://picsum.photos/seed/dinner/800/600",
                true);

        List<BuffetPackage> seededPackages = List.of(p1, p2, p3);
        for (BuffetPackage pkg : seededPackages) {
            packages.put(pkg.id(), pkg);
        }

        LocalDate baseDate = LocalDate.now().plusDays(1);
        List<BuffetSession> seededSessions = new ArrayList<>();
        int counter = 1;
        for (BuffetPackage pkg : seededPackages) {
            seededSessions.add(new BuffetSession(
                    "s" + counter++,
                    pkg.id(),
                    baseDate.toString(),
                    "12:00",
                    "14:30",
                    30,
                    8,
                    OPEN));
            seededSessions.add(new BuffetSession(
                    "s" + counter++,
                    pkg.id(),
                    baseDate.plusDays(1).toString(),
                    "18:00",
                    "21:00",
                    30,
                    12,
                    OPEN));
        }

        for (BuffetSession session : seededSessions) {
            sessions.put(session.id(), session);
        }
    }

    public record BuffetPackage(
            String id,
            String name,
            String type,
            String description,
            int pricePerPerson,
            String imageUrl,
            boolean active) {
    }

    public record BuffetSession(
            String id,
            String packageId,
            String sessionDate,
            String startTime,
            String endTime,
            int maxCapacity,
            int currentBooked,
            String status) {
    }

    public record ReservationRequest(
            String userId,
            String sessionId,
            int guestCount,
            String specialRequest,
            String status,
            String updatedAt) {
    }

    public record Reservation(
            String id,
            String userId,
            String sessionId,
            int guestCount,
            String specialRequest,
            String status,
            String createdAt,
            String updatedAt) {
    }

    public record ContactRequest(
            String name,
            String email,
            String message) {
    }

    public record ContactMessage(
            String id,
            String name,
            String email,
            String message,
            String createdAt) {
    }

}