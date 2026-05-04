package com.buffetease.buffet_ease.model.enums;

/**
 * BookingStatus — an enum (enumeration) that defines the allowed states of a booking.
 *
 * Using an enum instead of a plain String makes it impossible to accidentally
 * set an invalid status like "Confirmed" (wrong case) or "canceled" (typo).
 * The database column stores these as text: "CONFIRMED" or "CANCELLED".
 */
public enum BookingStatus {
    // The booking is active — the customer has a reserved seat.
    CONFIRMED,

    // The booking was cancelled — the seats have been returned to the session.
    CANCELLED
}
