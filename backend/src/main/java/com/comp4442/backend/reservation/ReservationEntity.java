package com.comp4442.backend.reservation;

import com.comp4442.backend.common.Enums.ReservationStatus;
import com.comp4442.backend.session.DiningSessionEntity;
import com.comp4442.backend.user.UserEntity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "reservations", indexes = {
        @Index(name = "idx_reservation_user", columnList = "user_id"),
        @Index(name = "idx_reservation_session", columnList = "session_id")
})
public class ReservationEntity {
    @Id
    private String id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private DiningSessionEntity session;

    @Column(nullable = false)
    private int guestCount;

    @Column(length = 1000)
    private String specialRequest;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status = ReservationStatus.PENDING;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        if (id == null) id = UUID.randomUUID().toString();
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public UserEntity getUser() { return user; }
    public void setUser(UserEntity user) { this.user = user; }
    public DiningSessionEntity getSession() { return session; }
    public void setSession(DiningSessionEntity session) { this.session = session; }
    public int getGuestCount() { return guestCount; }
    public void setGuestCount(int guestCount) { this.guestCount = guestCount; }
    public String getSpecialRequest() { return specialRequest; }
    public void setSpecialRequest(String specialRequest) { this.specialRequest = specialRequest; }
    public ReservationStatus getStatus() { return status; }
    public void setStatus(ReservationStatus status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
