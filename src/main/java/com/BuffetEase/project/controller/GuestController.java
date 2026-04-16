package com.BuffetEase.project.controller;

import com.BuffetEase.project.entity.Guest;
import com.BuffetEase.project.service.GuestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/guests")
public class GuestController {

    private final GuestService guestService;

    public GuestController(GuestService guestService) {
        this.guestService = guestService;
    }

    @PostMapping
    public ResponseEntity<Guest> createGuest(@RequestBody Guest guest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(guestService.createGuest(guest));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Guest> getGuest(@PathVariable String id) {
        return guestService.getGuestById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Guest>> getAllGuests() {
        return ResponseEntity.ok(guestService.getAllGuests());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Guest> getGuestByEmail(@PathVariable String email) {
        return guestService.getGuestByEmail(email)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Guest> updateGuest(@PathVariable String id, @RequestBody Guest guestDetails) {
        try {
            return ResponseEntity.ok(guestService.updateGuest(id, guestDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGuest(@PathVariable String id) {
        try {
            guestService.deleteGuest(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }
}