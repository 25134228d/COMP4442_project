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

@Service
@RequiredArgsConstructor
public class PackageService {
    
    private final PackageRepository packageRepository;
    private final SessionRepository sessionRepository;
    
    public List<PackageResponseDTO> getAllPackages() {
        return packageRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public PackageResponseDTO getPackageById(@NonNull Long id) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Package not found with id: " + id));
        return convertToDTO(pkg);
    }
    
    public List<SessionResponseDTO> getSessionsByPackageId(@NonNull Long packageId) {
        if (!packageRepository.existsById(packageId)) {
            throw new BusinessException("Package not found with id: " + packageId);
        }
        
        return sessionRepository.findUpcomingSessionsByPackageId(packageId).stream()
                .map(this::convertToSessionDTO)
                .collect(Collectors.toList());
    }
    
    private PackageResponseDTO convertToDTO(Package pkg) {
        return PackageResponseDTO.builder()
                .id(pkg.getId())
                .name(pkg.getName())
                .type(pkg.getType())
                .description(pkg.getDescription())
                .pricePerPerson(pkg.getPricePerPerson())
                .imageUrl(pkg.getImageUrl())
                .build();
    }
    
    private SessionResponseDTO convertToSessionDTO(Session session) {
        return SessionResponseDTO.builder()
                .id(session.getId())
                .sessionLabel(session.getSessionLabel())
                .date(session.getSessionDate())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .availableSeats(session.getAvailableSeats())
                .totalSeats(session.getTotalSeats())
                .build();
    }
}
