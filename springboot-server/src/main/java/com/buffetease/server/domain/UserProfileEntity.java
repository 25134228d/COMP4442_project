package com.buffetease.server.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "user_profiles")
public class UserProfileEntity {

    @Id
    private String uid;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(nullable = false)
    private String createdAt;

    @PrePersist
    public void prePersist() {
        if (uid == null || uid.isBlank()) {
            uid = UUID.randomUUID().toString();
        }
        if (createdAt == null || createdAt.isBlank()) {
            createdAt = Instant.now().toString();
        }
    }
}
