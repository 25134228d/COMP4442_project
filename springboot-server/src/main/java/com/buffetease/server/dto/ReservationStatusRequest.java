package com.buffetease.server.dto;

import com.buffetease.server.domain.ReservationStatus;
import jakarta.validation.constraints.NotNull;

public record ReservationStatusRequest(
                @NotNull ReservationStatus status) {
}
