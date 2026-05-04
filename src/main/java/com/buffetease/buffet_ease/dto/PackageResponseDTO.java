package com.buffetease.buffet_ease.dto;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

/**
 * PackageResponseDTO — Data Transfer Object for outgoing package data sent to the browser.
 *
 * PackageService converts each Package entity into this DTO before returning it via the API.
 * The browser receives a JSON array of these objects when the packages page loads.
 *
 * @Data    (Lombok) — auto-generates getters, setters, toString, equals, hashCode.
 * @Builder (Lombok) — allows fluent builder syntax: PackageResponseDTO.builder().id(1L).build()
 */
@Data
@Builder
public class PackageResponseDTO {
    private Long id;                  // Database primary key — used by the browser when sending a booking request.
    private String name;              // Display name, e.g. "Signature Dinner Buffet".
    private String type;              // Category shown on the card, e.g. "Dinner", "Brunch", "Chinese".
    private String description;       // Long description text shown on the package card.
    private BigDecimal pricePerPerson; // Price in HKD per guest, e.g. 388.00.
    private String imageUrl;          // URL of the package photo displayed on the card.
}
