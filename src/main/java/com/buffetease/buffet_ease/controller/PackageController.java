package com.buffetease.buffet_ease.controller;

import com.buffetease.buffet_ease.dto.PackageResponseDTO;
import com.buffetease.buffet_ease.dto.SessionResponseDTO;
import com.buffetease.buffet_ease.service.PackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * PackageController — REST API controller for package and session endpoints.
 *
 * Base URL: /api/packages
 *
 * Exposes three read-only endpoints used by the packages page to:
 *   1. Load the grid of all available buffet packages.
 *   2. Load details of a single package.
 *   3. Load the available time slots (sessions) for a selected package.
 *
 * Annotations on the class:
 *   @RestController    — all methods automatically return JSON.
 *   @RequestMapping    — all endpoints are prefixed with "/api/packages".
 *   @CrossOrigin("*")  — allows any browser origin to call these endpoints.
 *   @RequiredArgsConstructor (Lombok) — injects packageService via the constructor.
 */
@RestController
@RequestMapping("/api/packages")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PackageController {

    // Spring injects PackageService automatically via constructor injection.
    private final PackageService packageService;

    /**
     * GET /api/packages
     * Returns a list of ALL buffet packages in the database.
     * Called when the packages page first loads to render the card grid.
     */
    @GetMapping
    public ResponseEntity<List<PackageResponseDTO>> getAllPackages() {
        // Delegates to PackageService.getAllPackages() which queries the DB and returns DTOs.
        return ResponseEntity.ok(packageService.getAllPackages()); // HTTP 200 OK + JSON array
    }

    /**
     * GET /api/packages/{id}
     * Returns the details of a single package by its database ID.
     *
     * @PathVariable — extracts {id} from the URL (e.g. /api/packages/2).
     * @NonNull      — compile-time null check to ensure the path variable is provided.
     * Throws BusinessException (→ 400 Bad Request) if the package is not found.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PackageResponseDTO> getPackageById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(packageService.getPackageById(id));
    }

    /**
     * GET /api/packages/{id}/sessions
     * Returns available upcoming time slots for a specific package.
     * Called when the customer opens the booking modal to populate the session dropdown.
     * Only future sessions (today or later) are returned, sorted by date then time.
     *
     * @PathVariable — extracts {id} from the URL (e.g. /api/packages/1/sessions).
     */
    @GetMapping("/{id}/sessions")
    public ResponseEntity<List<SessionResponseDTO>> getSessionsByPackageId(@PathVariable @NonNull Long id) {
        // Delegates to PackageService.getSessionsByPackageId() which filters past sessions.
        return ResponseEntity.ok(packageService.getSessionsByPackageId(id));
    }
}
