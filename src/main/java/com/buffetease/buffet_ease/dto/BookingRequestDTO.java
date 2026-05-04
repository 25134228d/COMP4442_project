package com.buffetease.buffet_ease.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * BookingRequestDTO — Data Transfer Object for incoming booking creation requests.
 *
 * "DTO" means it is purely a data carrier — no business logic lives here.
 * The browser sends a JSON body when the customer submits the booking form;
 * Spring automatically converts ("deserialises") that JSON into this object.
 *
 * Every field has validation annotations. If any constraint fails, Spring throws
 * MethodArgumentNotValidException before the controller method even runs,
 * and GlobalExceptionHandler returns a 400 error to the browser.
 *
 * @Data (Lombok) — automatically generates getters, setters, toString, equals, hashCode.
 */
@Data
public class BookingRequestDTO {

    // The ID of the buffet package the customer selected (e.g. 1 = Signature Dinner Buffet).
    // @NotNull ensures the field must be present in the JSON (cannot be missing or null).
    @NotNull(message = "Package ID is required")
    private Long packageId;

    // The ID of the specific time slot the customer chose (e.g. 2 = Late Dinner 8:30 PM).
    @NotNull(message = "Session ID is required")
    private Long sessionId;

    // The customer's full name.
    // @NotBlank rejects null, empty string "", and whitespace-only strings like "   ".
    // @Size enforces minimum 2 and maximum 100 characters.
    @NotBlank(message = "Customer name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String customerName;

    // The customer's email address.
    // @Email validates the format — must contain "@" and a domain (e.g. user@example.com).
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String customerEmail;

    // The customer's phone number.
    // @Pattern validates against a regular expression:
    //   ^            — start of string
    //   [0-9+\-() ]+ — one or more of: digit, +, -, (, ), space
    //   $            — end of string
    // Allows formats like: 852-91234567, +852 9123 4567, (852) 91234567
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9+\\-() ]+$", message = "Invalid phone number format")
    private String customerPhone;

    // Number of guests dining (used to check seat availability and calculate total price).
    // @Min(1)  — must book for at least 1 person.
    // @Max(20) — maximum 20 guests per single booking.
    @NotNull(message = "Guest count is required")
    @Min(value = 1, message = "At least 1 guest required")
    @Max(value = 20, message = "Maximum 20 guests per booking")
    private Integer guestCount;

    // Optional free-text field — dietary restrictions, birthday messages, etc.
    // No validation annotation means this field can be null or empty.
    private String specialRequests;
}
