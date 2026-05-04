package com.buffetease.buffet_ease.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.buffetease.buffet_ease.model.enums.BookingStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Booking — JPA entity that maps to the "bookings" table in MySQL.
 *
 * Each row in the "bookings" table represents one customer reservation.
 * JPA (Java Persistence API) uses the annotations below to automatically
 * translate between Java objects and database rows — no manual SQL INSERT/SELECT needed.
 *
 * Lombok annotations (code generators that reduce boilerplate):
 *   @Data          — generates getters, setters, toString, equals, hashCode for all fields.
 *   @NoArgsConstructor  — generates an empty constructor: new Booking()
 *   @AllArgsConstructor — generates a constructor with all fields as parameters.
 */
@Entity                         // Tells JPA this class is a database entity (maps to a table).
@Table(name = "bookings")       // Maps this class to the "bookings" table in MySQL.
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    // ─── Primary Key ─────────────────────────────────────────────────────────────

    @Id                                                     // Marks this field as the primary key.
    @GeneratedValue(strategy = GenerationType.IDENTITY)     // Auto-increment: MySQL assigns 1, 2, 3, ...
    private Long id;

    // ─── Booking Identification ───────────────────────────────────────────────────

    // Maps to column "booking_reference". unique = no two bookings can share a reference.
    // length = 20 means the VARCHAR column is max 20 characters (e.g. "BKG-260504-1234").
    @Column(name = "booking_reference", unique = true, nullable = false, length = 20)
    private String bookingReference;

    // ─── Relationships ────────────────────────────────────────────────────────────

    // Many bookings can belong to one package (Many-to-One relationship).
    // FetchType.LAZY = the Package data is only loaded from DB when explicitly accessed (saves memory).
    // @JoinColumn maps this to the "package_id" foreign key column in the bookings table.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", nullable = false)
    private Package packageObj;

    // Many bookings can belong to one session (Many-to-One relationship).
    // @JoinColumn maps this to the "session_id" foreign key column.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    // ─── Customer Information ─────────────────────────────────────────────────────

    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;        // Full name of the customer who made the booking.

    @Column(name = "customer_email", nullable = false, length = 100)
    private String customerEmail;       // Used to look up bookings on the "My Bookings" page.

    @Column(name = "customer_phone", nullable = false, length = 20)
    private String customerPhone;       // Contact phone number for the restaurant to reach the customer.

    // ─── Booking Details ──────────────────────────────────────────────────────────

    @Column(name = "guest_count", nullable = false)
    private Integer guestCount;         // Number of seats reserved; used to reduce availableSeats.

    // columnDefinition = "TEXT" maps to MySQL TEXT type (unlimited length) instead of VARCHAR.
    @Column(name = "special_requests", columnDefinition = "TEXT")
    private String specialRequests;     // Optional notes from the customer (may be null).

    // precision = 10, scale = 2 → stores up to 99,999,999.99 (e.g. 776.00).
    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;      // pricePerPerson × guestCount, calculated in BookingService.

    // ─── Status ───────────────────────────────────────────────────────────────────

    // @Enumerated(EnumType.STRING) tells JPA to store "CONFIRMED" or "CANCELLED" as text,
    // not as a number (which would be harder to read in the database).
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status = BookingStatus.CONFIRMED; // Default status when a booking is first created.

    // ─── Timestamps ───────────────────────────────────────────────────────────────

    @Column(name = "created_at")
    private LocalDateTime createdAt;    // When the booking was first saved to the database.

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;    // When the booking was last modified (e.g. after cancellation).

    // ─── JPA Lifecycle Callbacks ──────────────────────────────────────────────────

    // @PrePersist — JPA calls this method automatically just BEFORE the first INSERT into the DB.
    // We use it to set the timestamps so we never forget to fill them in manually.
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now(); // Record the exact time this booking was created.
        updatedAt = LocalDateTime.now(); // Set updatedAt to the same time on creation.
    }

    // @PreUpdate — JPA calls this method automatically just BEFORE every UPDATE on this row.
    // This keeps updatedAt current whenever the booking is modified (e.g. cancelled).
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now(); // Refresh the "last modified" timestamp.
    }
}

