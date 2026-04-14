package com.comp4442.backend.buffetpkg;

import com.comp4442.backend.common.Enums.MealType;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "buffet_packages")
public class BuffetPackageEntity {
    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerPerson;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MealType type;

    private String imageUrl;

    @Column(nullable = false)
    private boolean isActive = true;

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
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPricePerPerson() { return pricePerPerson; }
    public void setPricePerPerson(BigDecimal pricePerPerson) { this.pricePerPerson = pricePerPerson; }
    public MealType getType() { return type; }
    public void setType(MealType type) { this.type = type; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}
