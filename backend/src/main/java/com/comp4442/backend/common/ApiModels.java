package com.comp4442.backend.common;

import com.comp4442.backend.common.Enums.MealType;
import com.comp4442.backend.common.Enums.ReservationStatus;
import com.comp4442.backend.common.Enums.SessionStatus;
import com.comp4442.backend.common.Enums.UserRole;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class ApiModels {
    public record UserProfileDto(String uid, String name, String email, String role, String createdAt) {}

    public record BuffetPackageDto(String id, String name, String description, BigDecimal pricePerPerson, MealType type, String imageUrl, boolean isActive) {}

    public record DiningSessionDto(String id, String packageId, String sessionDate, String startTime, String endTime, int maxCapacity, int currentBooked, SessionStatus status) {}

    public record ReservationDto(String id, String userId, String sessionId, int guestCount, String specialRequest, ReservationStatus status, String createdAt, String updatedAt) {}

    public record CreateReservationRequest(
            @NotBlank String sessionId,
            @Min(1) @Max(1000) int guestCount,
            String specialRequest
    ) {}

    public record UpdateReservationStatusRequest(@NotNull ReservationStatus status) {}

    public record UpsertPackageRequest(
            @NotBlank String name,
            @NotBlank String description,
            @NotNull BigDecimal pricePerPerson,
            @NotNull MealType type,
            String imageUrl,
            boolean isActive
    ) {}

    public record UpsertSessionRequest(
            @NotBlank String packageId,
            @NotNull LocalDate sessionDate,
            @NotNull LocalTime startTime,
            @NotNull LocalTime endTime,
            @Min(1) int maxCapacity,
            @Min(0) int currentBooked,
            @NotNull SessionStatus status
    ) {}
}
