package com.buffetease.buffet_ease.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * SessionResponseDTO — Data Transfer Object for outgoing session (time slot) data.
 *
 * When the customer clicks "Book Now" on a package, the browser calls
 * GET /api/packages/{id}/sessions and receives a JSON array of these objects.
 * Each object represents one available dining time slot for that package.
 *
 * @Data    (Lombok) — auto-generates getters, setters, toString, equals, hashCode.
 * @Builder (Lombok) — allows fluent builder syntax for constructing instances.
 */
@Data
@Builder
public class SessionResponseDTO {
    private Long id;              // Database primary key — sent back with the booking request to identify the slot.
    private String sessionLabel;  // Human-readable label shown in the dropdown, e.g. "Early Dinner (6:00 PM)".
    private LocalDate date;       // The calendar date of this session.
    private LocalTime startTime;  // Start time (24-hour format), e.g. 18:00.
    private LocalTime endTime;    // End time (24-hour format), e.g. 20:30.
    private Integer availableSeats; // How many seats are still open (decreases as bookings are made).
    private Integer totalSeats;     // Maximum capacity of this session.
}
