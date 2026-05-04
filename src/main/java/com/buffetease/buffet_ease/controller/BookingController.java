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

/**
 * BookingController — REST API controller for booking-related endpoints.
 *
 * Base URL: /api/bookings
 *
 * This class receives HTTP requests from the browser, delegates the actual work to
 * BookingService, and returns JSON responses. Controllers should contain NO business logic.
 *
 * Annotations on the class:
 *   @RestController      — combines @Controller + @ResponseBody: all methods return JSON automatically.
 *   @RequestMapping      — all endpoints in this class are prefixed with "/api/bookings".
 *   @CrossOrigin("*")    — allows any origin to call these endpoints (overrides the global CORS config for convenience during development).
 *   @RequiredArgsConstructor (Lombok) — generates a constructor that injects all final fields (bookingService).
 */
@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class BookingController {

    // BookingService is injected by Spring via the constructor (constructor injection).
    // "final" + @RequiredArgsConstructor means Spring automatically provides this bean.
    private final BookingService bookingService;

    /**
     * POST /api/bookings
     * Creates a new booking from the customer's form submission.
     *
     * @Valid — triggers validation of the BookingRequestDTO fields before this method runs.
     *          If validation fails, Spring throws MethodArgumentNotValidException
     *          and GlobalExceptionHandler returns a 400 error automatically.
     * @RequestBody — tells Spring to parse the HTTP request body (JSON) into BookingRequestDTO.
     * @NonNull — a compile-time null check; the parameter cannot be null.
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createBooking(@Valid @RequestBody @NonNull BookingRequestDTO request) {
        // Delegate to the service which contains all the business logic.
        BookingResponseDTO booking = bookingService.createBooking(request);

        // Build the JSON response body with three fields.
        Map<String, Object> response = new HashMap<>();
        response.put("bookingReference", booking.getBookingReference()); // e.g. "BKG-260504-1234"
        response.put("booking", booking);         // Full booking details object.
        response.put("message", "Booking created successfully");

        // ResponseEntity.ok() wraps the response with HTTP 200 OK status.
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/bookings/email/{email}
     * Returns all bookings associated with the given email address.
     * Used by the "My Bookings" page when the customer searches by email.
     *
     * @PathVariable — extracts {email} from the URL path (e.g. /api/bookings/email/user@test.com).
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<List<BookingResponseDTO>> getBookingsByEmail(@PathVariable @NonNull String email) {
        // Returns 200 OK with a JSON array of BookingResponseDTO objects.
        return ResponseEntity.ok(bookingService.getBookingsByEmail(email));
    }

    /**
     * PUT /api/bookings/{reference}/cancel
     * Cancels the booking identified by its booking reference string.
     * Also restores the cancelled seats back to the session.
     *
     * @PathVariable — extracts {reference} from the URL (e.g. /api/bookings/BKG-260504-1234/cancel).
     */
    @PutMapping("/{reference}/cancel")
    public ResponseEntity<Map<String, String>> cancelBooking(@PathVariable @NonNull String reference) {
        // Ask the service to cancel the booking and restore seats (no return value needed).
        bookingService.cancelBooking(reference);

        // Return a simple success message in a JSON map.
        Map<String, String> response = new HashMap<>();
        response.put("message", "Booking cancelled successfully");

        return ResponseEntity.ok(response); // HTTP 200 OK
    }
}
