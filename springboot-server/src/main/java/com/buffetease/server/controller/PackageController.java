package com.buffetease.server.controller;

import com.buffetease.server.domain.BuffetPackageEntity;
import com.buffetease.server.service.PackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/packages")
@RequiredArgsConstructor
public class PackageController {

    private final PackageService packageService;

    @GetMapping("/active")
    public List<BuffetPackageEntity> getActivePackages() {
        return packageService.getActivePackages();
    }

    @GetMapping
    public List<BuffetPackageEntity> getAllPackages() {
        return packageService.getAllPackages();
    }

    @GetMapping("/{id}")
    public BuffetPackageEntity getPackageById(@PathVariable String id) {
        return packageService.getPackageById(id);
    }

    @PostMapping
    public BuffetPackageEntity createPackage(@RequestBody BuffetPackageEntity request) {
        return packageService.createPackage(request);
    }

    @PutMapping("/{id}")
    public BuffetPackageEntity updatePackage(@PathVariable String id, @RequestBody BuffetPackageEntity request) {
        return packageService.updatePackage(id, request);
    }

    @DeleteMapping("/{id}")
    public void deletePackage(@PathVariable String id) {
        packageService.deletePackage(id);
    }
}
