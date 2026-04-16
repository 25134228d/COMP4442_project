package com.BuffetEase.project.controller;

import com.BuffetEase.project.entity.BuffetPackage;
import com.BuffetEase.project.service.BuffetPackageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/packages")
public class BuffetPackageController {

    private final BuffetPackageService buffetPackageService;

    public BuffetPackageController(BuffetPackageService buffetPackageService) {
        this.buffetPackageService = buffetPackageService;
    }

    @PostMapping
    public ResponseEntity<BuffetPackage> createPackage(@RequestBody BuffetPackage buffetPackage) {
        return ResponseEntity.status(HttpStatus.CREATED).body(buffetPackageService.createPackage(buffetPackage));
    }

    @GetMapping
    public ResponseEntity<List<BuffetPackage>> getAllPackages() {
        return ResponseEntity.ok(buffetPackageService.getAllPackages());
    }

    @GetMapping("/active")
    public ResponseEntity<List<BuffetPackage>> getActivePackages() {
        return ResponseEntity.ok(buffetPackageService.getActivePackages());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BuffetPackage> getPackageById(@PathVariable String id) {
        return buffetPackageService.getPackageById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<BuffetPackage> updatePackage(@PathVariable String id, @RequestBody BuffetPackage packageDetails) {
        try {
            return ResponseEntity.ok(buffetPackageService.updatePackage(id, packageDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePackage(@PathVariable String id) {
        buffetPackageService.deletePackage(id);
        return ResponseEntity.noContent().build();
    }
}