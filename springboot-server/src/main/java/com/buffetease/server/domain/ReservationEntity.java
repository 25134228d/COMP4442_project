package com.buffetease.server.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "reservations")
public class ReservationEntity {

    @Id
    private String id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String sessionId;

    @Column(nullable = false)
    private Integer guestCount;

    @Column(length = 2000)
    private String specialRequest;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status;

    @Column(nullable = false)
    private String createdAt;

    @Column(nullable = false)
    private String updatedAt;

    @PrePersist
    public void prePersist() {
        if (id == null || id.isBlank()) {
            id = UUID.randomUUID().toString();
        }
        String now = Instant.now().toString();
        if (createdAt == null || createdAt.isBlank()) {
            createdAt = now;
        }
        updatedAt = now;
        if (status == null) {
            status = ReservationStatus.PENDING;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now().toString();
    }
}
