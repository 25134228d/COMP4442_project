package com.buffetease.buffet_ease.dto;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PackageResponseDTO {
    private Long id;
    private String name;
    private String type;
    private String description;
    private BigDecimal pricePerPerson;
    private String imageUrl;
}