package com.buffetease.buffet_ease.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.buffetease.buffet_ease.model.ContactMessage;

/**
 * ContactMessageRepository — data access layer for the "contact_messages" table.
 *
 * Extends JpaRepository<ContactMessage, Long> which provides all standard CRUD operations:
 *   - save(message)    → INSERT a new contact message row into the DB.
 *   - findAll()        → SELECT * FROM contact_messages (for a future admin dashboard).
 *   - findById(id)     → SELECT WHERE id = ?
 *   - delete(message)  → DELETE a row.
 *
 * No custom query methods are needed here — ContactService only needs to save messages.
 * @Repository registers this interface as a Spring bean for dependency injection.
 */
@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
    // No custom methods needed — the built-in save() from JpaRepository is sufficient.
}
