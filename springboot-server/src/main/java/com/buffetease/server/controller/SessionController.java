package com.buffetease.server.controller;

import com.buffetease.server.domain.DiningSessionEntity;
import com.buffetease.server.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @GetMapping
    public List<DiningSessionEntity> getAllSessions() {
        return sessionService.getAllSessions();
    }

    @GetMapping("/package/{packageId}")
    public List<DiningSessionEntity> getSessionsByPackage(
            @PathVariable String packageId,
            @RequestParam(required = false) String date) {
        return sessionService.getSessionsByPackage(packageId, date);
    }

    @PostMapping
    public DiningSessionEntity createSession(@RequestBody DiningSessionEntity request) {
        return sessionService.createSession(request);
    }

    @PutMapping("/{id}")
    public DiningSessionEntity updateSession(@PathVariable String id, @RequestBody DiningSessionEntity request) {
        return sessionService.updateSession(id, request);
    }
}
