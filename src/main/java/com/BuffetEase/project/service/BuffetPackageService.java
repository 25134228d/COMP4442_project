package com.BuffetEase.project.service;

import com.BuffetEase.project.entity.BuffetPackage;
import com.BuffetEase.project.repository.BuffetPackageRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class BuffetPackageService {

    private final BuffetPackageRepository buffetPackageRepository;

    public BuffetPackageService(BuffetPackageRepository buffetPackageRepository) {
        this.buffetPackageRepository = buffetPackageRepository;
    }

    public BuffetPackage createPackage(BuffetPackage buffetPackage) {
        return buffetPackageRepository.save(buffetPackage);
    }

    public Optional<BuffetPackage> getPackageById(String id) {
        return buffetPackageRepository.findById(id);
    }

    public List<BuffetPackage> getAllPackages() {
        return buffetPackageRepository.findAll();
    }

    public List<BuffetPackage> getActivePackages() {
        return buffetPackageRepository.findByActive(true);
    }

    public BuffetPackage updatePackage(String id, BuffetPackage packageDetails) {
        return buffetPackageRepository.findById(id).map(pkg -> {
            pkg.setName(packageDetails.getName());
            pkg.setDescription(packageDetails.getDescription());
            pkg.setPricePerPerson(packageDetails.getPricePerPerson());
            pkg.setType(packageDetails.getType());
            pkg.setImageUrl(packageDetails.getImageUrl());
            pkg.setActive(packageDetails.isActive());
            return buffetPackageRepository.save(pkg);
        }).orElseThrow(() -> new RuntimeException("Package not found"));
    }

    public void deletePackage(String id) {
        buffetPackageRepository.deleteById(id);
    }
}