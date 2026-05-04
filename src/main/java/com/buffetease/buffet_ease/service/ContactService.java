package com.buffetease.buffet_ease.service;

import com.buffetease.buffet_ease.dto.ContactRequestDTO;
import com.buffetease.buffet_ease.model.ContactMessage;
import com.buffetease.buffet_ease.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * ContactService — business logic layer for the "Contact Us" feature.
 *
 * This is a simple service with one job: take validated contact form data
 * from the controller, convert it into a ContactMessage entity, and save it to the DB.
 *
 * @Service — registers this class as a Spring service bean.
 * @RequiredArgsConstructor (Lombok) — generates a constructor that injects contactMessageRepository.
 */
@Service
@RequiredArgsConstructor
public class ContactService {

    // Spring injects ContactMessageRepository automatically via constructor injection.
    private final ContactMessageRepository contactMessageRepository;

    /**
     * Saves a new contact message to the database.
     * Called by ContactController when a valid form is submitted on the About page.
     *
     * @param request the validated DTO containing name, email, and message from the form.
     */
    public void saveContactMessage(ContactRequestDTO request) {
        // Create a new ContactMessage entity (maps to a "contact_messages" table row).
        ContactMessage message = new ContactMessage();

        // Copy each field from the DTO into the entity.
        message.setName(request.getName());     // Sender's full name.
        message.setEmail(request.getEmail());   // Sender's email address.
        message.setMessage(request.getMessage()); // Message body text.
        message.setIsRead(false); // New messages are always unread when first saved.

        // INSERT a new row into the "contact_messages" table.
        // The @PrePersist in ContactMessage.java automatically sets the createdAt timestamp.
        contactMessageRepository.save(message);
    }
}
