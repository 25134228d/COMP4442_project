package com.buffetease.buffet_ease.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ContactMessage — JPA entity that maps to the "contact_messages" table in MySQL.
 *
 * Each row stores one message submitted by a visitor through the "Contact Us" form
 * on the About page. The restaurant admin can later read these messages from the database.
 *
 * Lombok annotations:
 *   @Data          — generates getters, setters, toString, equals, hashCode.
 *   @NoArgsConstructor  — generates empty constructor.
 *   @AllArgsConstructor — generates constructor with all fields.
 */
@Entity                              // Marks this class as a JPA entity (database-mapped).
@Table(name = "contact_messages")    // Maps to the "contact_messages" table in MySQL.
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactMessage {

    // ─── Primary Key ─────────────────────────────────────────────────────────────

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment: 1, 2, 3, ...
    private Long id;

    // ─── Message Content ──────────────────────────────────────────────────────────

    @Column(nullable = false, length = 100)
    private String name;   // Full name of the person who sent the message.

    @Column(nullable = false, length = 100)
    private String email;  // Email address of the sender (for the restaurant to reply).

    // columnDefinition = "TEXT" stores the message as MySQL TEXT (no fixed length limit).
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message; // The body of the customer's message.

    // ─── Read Status ──────────────────────────────────────────────────────────────

    // isRead tracks whether a restaurant staff member has seen this message.
    // Defaults to false (unread) when the message is first saved.
    @Column(name = "is_read")
    private Boolean isRead = false;

    // ─── Timestamp ───────────────────────────────────────────────────────────────

    @Column(name = "created_at")
    private LocalDateTime createdAt; // Automatically set when the message is first saved.

    // ─── JPA Lifecycle Callback ───────────────────────────────────────────────────

    // @PrePersist runs automatically just before the first INSERT into the DB.
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now(); // Record the exact submission time.
    }
}

