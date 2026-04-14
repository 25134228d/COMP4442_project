package com.comp4442.backend.buffetpkg;

import com.comp4442.backend.common.ApiException;
import com.comp4442.backend.common.ApiModels.UpsertPackageRequest;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class BuffetPackageService {
    private final BuffetPackageRepository repository;

    public BuffetPackageService(BuffetPackageRepository repository) {
        this.repository = repository;
    }

    public List<BuffetPackageEntity> getActive() { return repository.findByIsActiveTrue(); }
    public List<BuffetPackageEntity> getAll() { return repository.findAll(); }

    public BuffetPackageEntity getById(String id) {
        return repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Package not found"));
    }

    public BuffetPackageEntity create(UpsertPackageRequest req) {
        BuffetPackageEntity entity = new BuffetPackageEntity();
        apply(entity, req);
        return repository.save(entity);
    }

    public BuffetPackageEntity update(String id, UpsertPackageRequest req) {
        BuffetPackageEntity entity = getById(id);
        apply(entity, req);
        return repository.save(entity);
    }

    public void delete(String id) {
        if (!repository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Package not found");
        }
        repository.deleteById(id);
    }

    private void apply(BuffetPackageEntity entity, UpsertPackageRequest req) {
        entity.setName(req.name());
        entity.setDescription(req.description());
        entity.setPricePerPerson(req.pricePerPerson());
        entity.setType(req.type());
        entity.setImageUrl(req.imageUrl());
        entity.setActive(req.isActive());
    }
}
