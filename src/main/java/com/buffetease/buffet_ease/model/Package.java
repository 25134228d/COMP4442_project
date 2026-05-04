package com.buffetease.buffet_ease.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Package — JPA entity that maps to the "packages" table in MySQL.
 *
 * Each row represents one buffet dining package offered by the restaurant
 * (e.g. Signature Dinner Buffet, Weekend Brunch, Premium Seafood Feast).
 * One package can have many sessions (time slots) on different dates.
 *
 * Lombok annotations:
 *   @Data          — generates getters, setters, toString, equals, hashCode.
 *   @NoArgsConstructor  — generates empty constructor.
 *   @AllArgsConstructor — generates constructor with all fields.
 */
@Entity                      // Marks this class as a JPA entity (mapped to a database table).
@Table(name = "packages")    // Maps to the "packages" table in MySQL.
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Package {

    // ─── Primary Key ─────────────────────────────────────────────────────────────

    @Id                                                     // Primary key of this table.
    @GeneratedValue(strategy = GenerationType.IDENTITY)     // Auto-increment: 1, 2, 3, ...
    private Long id;

    // ─── Package Information ──────────────────────────────────────────────────────

    // Maps to the "name" column. nullable = false means the DB enforces NOT NULL.
    @Column(nullable = false, length = 100)
    private String name;           // Display name, e.g. "Signature Dinner Buffet".

    @Column(nullable = false, length = 50)
    private String type;           // Category label, e.g. "Dinner", "Brunch", "Chinese".

    // columnDefinition = "TEXT" stores unlimited text in MySQL (no length limit).
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;    // Long description shown on the package card.

    // precision = 10 total digits, scale = 2 decimal places → e.g. 388.00
    @Column(name = "price_per_person", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerPerson; // Cost per guest; multiplied by guestCount for total price.

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;       // URL of the package photo displayed in the browser.

    @Column(name = "created_at")
    private LocalDateTime createdAt; // Timestamp automatically set when the row is first inserted.

    // ─── Relationship: One Package → Many Sessions ────────────────────────────────

    // @JsonIgnore prevents infinite recursion when Jackson serialises this object to JSON.
    // (Without it: Package → sessions → each session has a packageObj → Package → sessions → ...)
    @JsonIgnore
    // mappedBy = "packageObj" means the foreign key lives in the Session table (session.package_id).
    // CascadeType.ALL = if this package is deleted, all its sessions are also deleted.
    // FetchType.LAZY = sessions are only loaded from DB when accessed, not automatically.
    @OneToMany(mappedBy = "packageObj", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Session> sessions = new ArrayList<>(); // All time slots for this package.

    // ─── JPA Lifecycle Callback ───────────────────────────────────────────────────

    // Automatically sets createdAt just before the first INSERT into the DB.
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}


