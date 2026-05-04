package com.buffetease.buffet_ease.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Session — JPA entity that maps to the "sessions" table in MySQL.
 *
 * A Session is a specific dining time slot for a package on a particular date.
 * Example: Package "Signature Dinner Buffet" might have two sessions on the same day:
 *   - Early Dinner (6:00 PM – 8:30 PM) with 50 seats
 *   - Late Dinner  (8:30 PM – 11:00 PM) with 50 seats
 *
 * The availableSeats field is decremented when a booking is created
 * and incremented back when a booking is cancelled.
 *
 * Lombok annotations:
 *   @Data          — generates getters, setters, toString, equals, hashCode.
 *   @NoArgsConstructor  — generates empty constructor.
 *   @AllArgsConstructor — generates constructor with all fields.
 */
@Entity                      // Marks this class as a JPA entity.
@Table(name = "sessions")    // Maps to the "sessions" table in MySQL.
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Session {

    // ─── Primary Key ─────────────────────────────────────────────────────────────

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment primary key.
    private Long id;

    // ─── Relationship: Many Sessions → One Package ────────────────────────────────

    // Many sessions belong to one package (Many-to-One).
    // FetchType.LAZY = package data is only loaded from DB when explicitly accessed.
    // @JoinColumn maps this to the "package_id" foreign key column in the sessions table.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", nullable = false)
    private Package packageObj; // The parent package this session belongs to.

    // ─── Session Details ──────────────────────────────────────────────────────────

    @Column(name = "session_label", nullable = false, length = 50)
    private String sessionLabel;  // Human-readable label shown in the dropdown, e.g. "Early Dinner (6:00 PM)".

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate; // Calendar date (year-month-day) — no time component.

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;   // Time the session begins (24-hour), e.g. 18:00.

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;     // Time the session ends, e.g. 20:30.

    // ─── Seat Availability ────────────────────────────────────────────────────────

    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats;      // Maximum capacity — stays fixed (e.g. 50).

    @Column(name = "available_seats", nullable = false)
    private Integer availableSeats;  // Remaining open seats — changes as bookings are made/cancelled.

    // ─── Timestamp ───────────────────────────────────────────────────────────────

    @Column(name = "created_at")
    private LocalDateTime createdAt; // Automatically set when the session row is first created.

    // ─── JPA Lifecycle Callback ───────────────────────────────────────────────────

    // @PrePersist runs automatically just before the first INSERT into the DB.
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now(); // Record the exact time this session was created.
    }
}

