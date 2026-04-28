package com.buffetease.buffet_ease.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class BookingRequestDTO {
    
    @NotNull(message = "Package ID is required")
    private Long packageId;
    
    @NotNull(message = "Session ID is required")
    private Long sessionId;
    
    @NotBlank(message = "Customer name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String customerName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String customerEmail;
    
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9+\\-() ]+$", message = "Invalid phone number format")
    private String customerPhone;
    
    @NotNull(message = "Guest count is required")
    @Min(value = 1, message = "At least 1 guest required")
    @Max(value = 20, message = "Maximum 20 guests per booking")
    private Integer guestCount;
    
    private String specialRequests;
}
