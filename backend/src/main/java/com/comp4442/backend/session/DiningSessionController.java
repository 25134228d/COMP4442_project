package com.comp4442.backend.session;

import com.comp4442.backend.common.ApiModels.UpsertSessionRequest;
import com.comp4442.backend.common.Mappers;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class DiningSessionController {
    private final DiningSessionService service;

    public DiningSessionController(DiningSessionService service) {
        this.service = service;
    }

    @GetMapping("/sessions")
    public List<?> byPackage(@RequestParam(required = false) String packageId,
                             @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.findByPackageAndDate(packageId, date).stream().map(Mappers::toSessionDto).toList();
    }

    @GetMapping("/sessions/all")
    public List<?> allSessions() {
        return service.findAll().stream().map(Mappers::toSessionDto).toList();
    }

    @GetMapping("/admin/sessions")
    public List<?> adminAll() {
        return service.findAll().stream().map(Mappers::toSessionDto).toList();
    }

    @PostMapping("/admin/sessions")
    public Object create(@Valid @RequestBody UpsertSessionRequest req) {
        return Mappers.toSessionDto(service.create(req));
    }

    @PutMapping("/admin/sessions/{id}")
    public Object update(@PathVariable String id, @Valid @RequestBody UpsertSessionRequest req) {
        return Mappers.toSessionDto(service.update(id, req));
    }
}
