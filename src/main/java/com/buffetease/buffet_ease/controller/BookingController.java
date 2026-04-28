package com.buffetease.buffet_ease.controller;

import com.buffetease.buffet_ease.dto.BookingRequestDTO;
import com.buffetease.buffet_ease.dto.BookingResponseDTO;
import com.buffetease.buffet_ease.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class BookingController {
    
    private final BookingService bookingService;
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createBooking(@Valid @RequestBody @NonNull BookingRequestDTO request) {
        BookingResponseDTO booking = bookingService.createBooking(request);
        
        Map<String, Object> response = new HashMap<>();
        response.put("bookingReference", booking.getBookingReference());
        response.put("booking", booking);
        response.put("message", "Booking created successfully");
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/email/{email}")
    public ResponseEntity<List<BookingResponseDTO>> getBookingsByEmail(@PathVariable @NonNull String email) {
        return ResponseEntity.ok(bookingService.getBookingsByEmail(email));
    }
    
    @PutMapping("/{reference}/cancel")
    public ResponseEntity<Map<String, String>> cancelBooking(@PathVariable @NonNull String reference) {
        bookingService.cancelBooking(reference);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Booking cancelled successfully");
        
        return ResponseEntity.ok(response);
    }
}