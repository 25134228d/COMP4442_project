package com.buffetease.buffet_ease.exception;

/**
 * BusinessException — a custom exception class for expected business rule violations.
 *
 * We throw this whenever a user action breaks a business rule, for example:
 *   - Trying to book a session that is already full.
 *   - Trying to book a past session.
 *   - Cancelling a booking that is already cancelled.
 *
 * By extending RuntimeException we don't need try-catch blocks at every call site;
 * the GlobalExceptionHandler catches it centrally and sends a clean JSON error to the browser.
 */
public class BusinessException extends RuntimeException {

    /**
     * Constructor — creates a new BusinessException with a human-readable error message.
     *
     * @param message the error description (e.g. "Not enough available seats. Only 2 seats left.")
     */
    public BusinessException(String message) {
        // Pass the message to the parent RuntimeException so it can be retrieved with getMessage().
        super(message);
    }
}
