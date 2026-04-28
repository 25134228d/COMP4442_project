package com.buffetease.buffet_ease.controller;

import com.buffetease.buffet_ease.dto.PackageResponseDTO;
import com.buffetease.buffet_ease.dto.SessionResponseDTO;
import com.buffetease.buffet_ease.service.PackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/packages")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class PackageController {
    
    private final PackageService packageService;
    
    @GetMapping
    public ResponseEntity<List<PackageResponseDTO>> getAllPackages() {
        return ResponseEntity.ok(packageService.getAllPackages());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PackageResponseDTO> getPackageById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(packageService.getPackageById(id));
    }
    
    @GetMapping("/{id}/sessions")
    public ResponseEntity<List<SessionResponseDTO>> getSessionsByPackageId(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(packageService.getSessionsByPackageId(id));
    }
}