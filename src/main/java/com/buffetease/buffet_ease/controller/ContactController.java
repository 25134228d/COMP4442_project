package com.buffetease.buffet_ease.controller;

import com.buffetease.buffet_ease.dto.ContactRequestDTO;
import com.buffetease.buffet_ease.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ContactController {
    
    private final ContactService contactService;
    
    @PostMapping
    public ResponseEntity<Map<String, String>> sendMessage(@Valid @RequestBody ContactRequestDTO request) {
        contactService.saveContactMessage(request);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Message sent successfully");
        
        return ResponseEntity.ok(response);
    }
}
