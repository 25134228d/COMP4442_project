package com.buffetease.buffet_ease.controller;

import com.buffetease.buffet_ease.dto.ContactRequestDTO;
import com.buffetease.buffet_ease.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

/**
 * ContactController — REST API controller for the "Contact Us" form.
 *
 * Base URL: /api/contact
 *
 * Receives the contact form submission from the About page and delegates
 * saving the message to ContactService.
 *
 * Annotations on the class:
 *   @RestController    — marks this as a REST controller; all methods return JSON automatically.
 *   @RequestMapping    — all endpoints are prefixed with "/api/contact".
 *   @CrossOrigin("*")  — allows any browser origin to call this endpoint.
 *   @RequiredArgsConstructor (Lombok) — injects contactService via the constructor.
 */
@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ContactController {

    // Spring injects ContactService automatically (constructor injection via Lombok).
    private final ContactService contactService;

    /**
     * POST /api/contact
     * Receives the "Contact Us" form data and saves it to the database.
     *
     * @Valid        — validates the ContactRequestDTO fields (name, email, message are required).
     *                If validation fails, Spring returns 400 Bad Request automatically.
     * @RequestBody  — deserialises the JSON request body into ContactRequestDTO.
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> sendMessage(@Valid @RequestBody ContactRequestDTO request) {
        // Pass the validated data to the service to create and save the ContactMessage entity.
        contactService.saveContactMessage(request);

        // Build a simple JSON success response: { "message": "Message sent successfully" }
        Map<String, String> response = new HashMap<>();
        response.put("message", "Message sent successfully");

        // Return HTTP 200 OK with the success JSON body.
        return ResponseEntity.ok(response);
    }
}
