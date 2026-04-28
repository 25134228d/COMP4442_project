package com.buffetease.buffet_ease.dto;

import com.buffetease.buffet_ease.model.enums.BookingStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class BookingResponseDTO {
    private Long id;
    private String bookingReference;
    private String packageName;
    private String sessionLabel;
    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private Integer guestCount;
    private String specialRequests;
    private BigDecimal totalPrice;
    private BookingStatus status;
    private String createdAt;
}