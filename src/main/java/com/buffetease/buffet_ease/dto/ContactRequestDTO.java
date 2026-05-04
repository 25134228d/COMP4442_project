package com.buffetease.buffet_ease.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * ContactRequestDTO — Data Transfer Object for incoming "Contact Us" form submissions.
 *
 * The browser sends a JSON body when the customer submits the contact form on the About page.
 * Spring deserialises that JSON into this object and then validates the fields before
 * the ContactController method runs.
 *
 * @Data (Lombok) — auto-generates getters, setters, toString, equals, hashCode.
 */
@Data
public class ContactRequestDTO {

    // The sender's name — must not be blank (null, "", or whitespace-only are all rejected).
    @NotBlank(message = "Name is required")
    private String name;

    // The sender's email address — must not be blank AND must match a valid email format.
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    // The body of the message — must not be blank.
    @NotBlank(message = "Message is required")
    private String message;
}
