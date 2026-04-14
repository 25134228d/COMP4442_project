package com.comp4442.backend.session;

import com.comp4442.backend.buffetpkg.BuffetPackageService;
import com.comp4442.backend.common.ApiException;
import com.comp4442.backend.common.ApiModels.UpsertSessionRequest;
import com.comp4442.backend.common.Enums.SessionStatus;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class DiningSessionService {
    private final DiningSessionRepository repository;
    private final BuffetPackageService packageService;

    public DiningSessionService(DiningSessionRepository repository, BuffetPackageService packageService) {
        this.repository = repository;
        this.packageService = packageService;
    }

    public List<DiningSessionEntity> findByPackageAndDate(String packageId, LocalDate date) {
        if (packageId == null || packageId.isBlank()) return repository.findAll();
        if (date == null) return repository.findByBuffetPackageId(packageId);
        return repository.findByBuffetPackageIdAndSessionDate(packageId, date);
    }

    public List<DiningSessionEntity> findAll() { return repository.findAll(); }

    public DiningSessionEntity getById(String id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Session not found"));
    }

    public DiningSessionEntity create(UpsertSessionRequest req) {
        DiningSessionEntity entity = new DiningSessionEntity();
        apply(entity, req);
        return repository.save(entity);
    }

    public DiningSessionEntity update(String id, UpsertSessionRequest req) {
        DiningSessionEntity entity = getById(id);
        apply(entity, req);
        return repository.save(entity);
    }

    private void apply(DiningSessionEntity entity, UpsertSessionRequest req) {
        if (req.currentBooked() > req.maxCapacity()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "currentBooked cannot exceed maxCapacity");
        }
        entity.setBuffetPackage(packageService.getById(req.packageId()));
        entity.setSessionDate(req.sessionDate());
        entity.setStartTime(req.startTime());
        entity.setEndTime(req.endTime());
        entity.setMaxCapacity(req.maxCapacity());
        entity.setCurrentBooked(req.currentBooked());
        SessionStatus status = req.status();
        if (entity.getCurrentBooked() >= entity.getMaxCapacity() && status == SessionStatus.OPEN) {
            status = SessionStatus.FULL;
        }
        entity.setStatus(status);
    }
}
