package com.comp4442.backend.buffetpkg;

import com.comp4442.backend.common.ApiModels.UpsertPackageRequest;
import com.comp4442.backend.common.Mappers;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class BuffetPackageController {
    private final BuffetPackageService service;

    public BuffetPackageController(BuffetPackageService service) {
        this.service = service;
    }

    @GetMapping("/packages/active")
    public List<?> active() {
        return service.getActive().stream().map(Mappers::toPackageDto).toList();
    }

    @GetMapping("/packages/{id}")
    public Object getById(@PathVariable String id) {
        return Mappers.toPackageDto(service.getById(id));
    }

    @GetMapping("/admin/packages")
    public List<?> all() {
        return service.getAll().stream().map(Mappers::toPackageDto).toList();
    }

    @PostMapping("/admin/packages")
    public Object create(@Valid @RequestBody UpsertPackageRequest req) {
        return Mappers.toPackageDto(service.create(req));
    }

    @PutMapping("/admin/packages/{id}")
    public Object update(@PathVariable String id, @Valid @RequestBody UpsertPackageRequest req) {
        return Mappers.toPackageDto(service.update(id, req));
    }

    @DeleteMapping("/admin/packages/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
