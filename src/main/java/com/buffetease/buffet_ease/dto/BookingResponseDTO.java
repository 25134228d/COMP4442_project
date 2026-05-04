package com.buffetease.buffet_ease.dto;

import com.buffetease.buffet_ease.model.enums.BookingStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * BookingResponseDTO — Data Transfer Object for outgoing booking data sent to the browser.
 *
 * After creating or looking up a booking, BookingService converts the Booking entity into
 * this DTO before returning it. This controls exactly which fields the browser receives —
 * we never expose internal database details (e.g. lazy-loaded JPA proxies) directly.
 *
 * @Data    (Lombok) — generates getters, setters, toString, equals, hashCode.
 * @Builder (Lombok) — generates a fluent builder pattern so we can write:
 *                     BookingResponseDTO.builder().id(1L).packageName("Dinner").build()
 */
@Data
@Builder
public class BookingResponseDTO {

    private Long id;                    // Auto-generated database primary key of the booking row.
    private String bookingReference;    // Human-readable reference, e.g. "BKG-260504-1234".
    private String packageName;         // Name of the booked package, e.g. "Signature Dinner Buffet".
    private String sessionLabel;        // Human-readable slot label, e.g. "Early Dinner (6:00 PM)".
    private LocalDate sessionDate;      // The calendar date of the session (year-month-day).
    private LocalTime startTime;        // When the session begins, e.g. 18:00.
    private LocalTime endTime;          // When the session ends, e.g. 20:30.
    private String customerName;        // Full name of the person who made the booking.
    private String customerEmail;       // Email used for the booking (used to look up bookings later).
    private String customerPhone;       // Contact phone number.
    private Integer guestCount;         // Number of guests in this booking.
    private String specialRequests;     // Dietary or other special notes (may be null).
    private BigDecimal totalPrice;      // pricePerPerson × guestCount, e.g. 776.00.
    private BookingStatus status;       // CONFIRMED or CANCELLED.
    private String createdAt;           // Timestamp when the booking was first created.
}
