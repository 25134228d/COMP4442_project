package com.buffetease.buffet_ease.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class SessionResponseDTO {
    private Long id;
    private String sessionLabel;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer availableSeats;
    private Integer totalSeats;
}