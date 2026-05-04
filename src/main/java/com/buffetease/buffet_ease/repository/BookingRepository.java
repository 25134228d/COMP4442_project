package com.buffetease.buffet_ease.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.buffetease.buffet_ease.model.Booking;
import com.buffetease.buffet_ease.model.enums.BookingStatus;

/**
 * BookingRepository — data access layer for the "bookings" table.
 *
 * By extending JpaRepository<Booking, Long>, Spring Data JPA automatically provides:
 *   - save(booking)         → INSERT or UPDATE a row
 *   - findById(id)          → SELECT WHERE id = ?
 *   - findAll()             → SELECT * FROM bookings
 *   - delete(booking)       → DELETE a row
 *   - existsById(id)        → SELECT COUNT(*) WHERE id = ?
 *   ... and many more standard CRUD operations — all without writing any SQL.
 *
 * The custom methods below are "query derivation": Spring reads the method name
 * and automatically generates the SQL query. No @Query annotation or SQL needed.
 *
 * @Repository tells Spring to register this as a database-access bean and to wrap
 * any database exceptions in Spring's standard DataAccessException hierarchy.
 */
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /**
     * Spring generates: SELECT * FROM bookings WHERE customer_email = ?
     * Used by the "My Bookings" page to find all reservations for a given email.
     */
    List<Booking> findByCustomerEmail(String email);

    /**
     * Spring generates: SELECT * FROM bookings WHERE booking_reference = ?
     * Returns Optional<Booking> — if not found, Optional is empty (no NullPointerException).
     * Used when cancelling a booking by its reference string (e.g. "BKG-260504-1234").
     */
    Optional<Booking> findByBookingReference(String bookingReference);

    /**
     * Spring generates: SELECT * FROM bookings WHERE customer_email = ? AND status = ?
     * Allows filtering bookings by both email and status (CONFIRMED or CANCELLED).
     * Not currently used in controllers but available for future admin features.
     */
    List<Booking> findByCustomerEmailAndStatus(String email, BookingStatus status);
}
