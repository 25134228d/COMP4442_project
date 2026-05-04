package com.buffetease.buffet_ease.service;

import com.buffetease.buffet_ease.dto.PackageResponseDTO;
import com.buffetease.buffet_ease.dto.SessionResponseDTO;
import com.buffetease.buffet_ease.exception.BusinessException;
import com.buffetease.buffet_ease.model.Package;
import com.buffetease.buffet_ease.model.Session;
import com.buffetease.buffet_ease.repository.PackageRepository;
import com.buffetease.buffet_ease.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

/**
 * PackageService — business logic layer for reading packages and sessions.
 *
 * Provides three read-only operations used by PackageController:
 *   1. getAllPackages          — returns all available buffet packages.
 *   2. getPackageById         — returns one package by ID.
 *   3. getSessionsByPackageId — returns upcoming sessions for a package.
 *
 * @Service — registers this class as a Spring service bean.
 * @RequiredArgsConstructor (Lombok) — generates a constructor that injects the two repositories.
 */
@Service
@RequiredArgsConstructor
public class PackageService {

    // Spring injects these repositories automatically via constructor injection.
    private final PackageRepository packageRepository;   // Access to the "packages" table.
    private final SessionRepository sessionRepository;   // Access to the "sessions" table.

    // ═══════════════════════════════════════════════════════════════════════════════════
    // PUBLIC METHOD 1: Get all packages
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * Fetches every package from the database and converts each to a PackageResponseDTO.
     * Called when the packages page loads to render the card grid.
     */
    public List<PackageResponseDTO> getAllPackages() {
        // packageRepository.findAll() executes: SELECT * FROM packages
        // .stream()          — convert the List<Package> into a Stream for processing.
        // .map(this::convertToDTO) — apply convertToDTO to each Package entity.
        // .collect(...)      — gather the transformed DTOs back into a List.
        return packageRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════════════════════════════════
    // PUBLIC METHOD 2: Get one package by ID
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * Fetches a single package by its database ID.
     * Throws BusinessException (→ HTTP 400) if no package with that ID exists.
     *
     * @NonNull — compile-time guarantee that id cannot be null.
     */
    public PackageResponseDTO getPackageById(@NonNull Long id) {
        // findById returns Optional<Package>; orElseThrow throws BusinessException if empty.
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Package not found with id: " + id));
        // Convert the entity to a DTO and return it.
        return convertToDTO(pkg);
    }

    // ═══════════════════════════════════════════════════════════════════════════════════
    // PUBLIC METHOD 3: Get upcoming sessions for a package
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * Returns only future (upcoming) sessions for a given package, sorted by date and time.
     * Used to populate the session dropdown in the booking modal.
     * Throws BusinessException if the package ID does not exist.
     */
    public List<SessionResponseDTO> getSessionsByPackageId(@NonNull Long packageId) {
        // First check the package exists before querying sessions.
        if (!packageRepository.existsById(packageId)) {
            throw new BusinessException("Package not found with id: " + packageId);
        }

        // Custom JPQL query in SessionRepository filters sessions to today and future,
        // then sorts by sessionDate ASC, startTime ASC.
        return sessionRepository.findUpcomingSessionsByPackageId(packageId).stream()
                .map(this::convertToSessionDTO)   // Convert each Session entity to SessionResponseDTO.
                .collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════════════════════════════════
    // PRIVATE HELPER: Convert a Package entity to PackageResponseDTO
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * Uses the @Builder pattern (from Lombok @Builder on PackageResponseDTO) to
     * construct a PackageResponseDTO from a Package entity.
     * Only exposes the fields the browser needs; internal JPA details are hidden.
     */
    private PackageResponseDTO convertToDTO(Package pkg) {
        return PackageResponseDTO.builder()
                .id(pkg.getId())                         // Database primary key.
                .name(pkg.getName())                     // e.g. "Signature Dinner Buffet"
                .type(pkg.getType())                     // e.g. "Dinner"
                .description(pkg.getDescription())       // Long description text.
                .pricePerPerson(pkg.getPricePerPerson()) // e.g. 388.00
                .imageUrl(pkg.getImageUrl())             // Photo URL.
                .build(); // Constructs the PackageResponseDTO.
    }

    // ═══════════════════════════════════════════════════════════════════════════════════
    // PRIVATE HELPER: Convert a Session entity to SessionResponseDTO
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * Converts a Session entity into a SessionResponseDTO for the browser.
     * The browser uses this data to populate the session dropdown in the booking modal.
     */
    private SessionResponseDTO convertToSessionDTO(Session session) {
        return SessionResponseDTO.builder()
                .id(session.getId())                           // Database primary key — sent back with the booking request.
                .sessionLabel(session.getSessionLabel())       // e.g. "Early Dinner (6:00 PM)"
                .date(session.getSessionDate())                // e.g. 2026-05-10
                .startTime(session.getStartTime())             // e.g. 18:00
                .endTime(session.getEndTime())                 // e.g. 20:30
                .availableSeats(session.getAvailableSeats())   // Remaining open seats.
                .totalSeats(session.getTotalSeats())           // Maximum capacity.
                .build();
    }
}
