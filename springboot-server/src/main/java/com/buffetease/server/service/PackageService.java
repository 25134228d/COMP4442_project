package com.buffetease.server.service;

import com.buffetease.server.domain.BuffetPackageEntity;
import com.buffetease.server.repository.BuffetPackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PackageService {

    private final BuffetPackageRepository packageRepository;

    public List<BuffetPackageEntity> getActivePackages() {
        return packageRepository.findByIsActiveTrue();
    }

    public List<BuffetPackageEntity> getAllPackages() {
        return packageRepository.findAll();
    }

    public BuffetPackageEntity getPackageById(String id) {
        return packageRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Package not found: " + id));
    }

    public BuffetPackageEntity createPackage(BuffetPackageEntity request) {
        request.setId(null);
        return packageRepository.save(request);
    }

    public BuffetPackageEntity updatePackage(String id, BuffetPackageEntity request) {
        BuffetPackageEntity existing = getPackageById(id);
        existing.setName(request.getName());
        existing.setDescription(request.getDescription());
        existing.setPricePerPerson(request.getPricePerPerson());
        existing.setType(request.getType());
        existing.setImageUrl(request.getImageUrl());
        existing.setIsActive(request.getIsActive());
        return packageRepository.save(existing);
    }

    public void deletePackage(String id) {
        if (!packageRepository.existsById(id)) {
            throw new NotFoundException("Package not found: " + id);
        }
        packageRepository.deleteById(id);
    }
}
