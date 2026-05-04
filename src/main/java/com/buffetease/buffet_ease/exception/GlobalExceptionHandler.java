package com.buffetease.buffet_ease.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.HashMap;
import java.util.Map;

/**
 * GlobalExceptionHandler — a centralised error handler for the entire application.
 *
 * Instead of writing try-catch in every controller method, we put all error handling here.
 * Spring automatically routes any unhandled exception thrown in a controller or service
 * to the matching @ExceptionHandler method below, which converts it into a JSON response
 * the browser can display (e.g. { "error": "Not enough available seats. Only 2 seats left." }).
 *
 * @RestControllerAdvice = @ControllerAdvice + @ResponseBody:
 *   - Applies globally to all controllers.
 *   - Automatically serialises the returned Map to JSON.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles BusinessException — triggered by our own business rule violations
     * (e.g. not enough seats, booking not found, past session).
     * Returns HTTP 400 Bad Request with the error message.
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Map<String, String>> handleBusinessException(BusinessException ex) {
        // Create a Map to hold the JSON response body: { "error": "..." }
        Map<String, String> error = new HashMap<>();
        // Put the exception's message as the value for the "error" key.
        error.put("error", ex.getMessage());
        // Return 400 Bad Request with the error JSON body.
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handles MethodArgumentNotValidException — triggered automatically by Spring
     * when a @Valid annotated request body fails its validation constraints
     * (e.g. missing customerName, invalid email format, guestCount > 20).
     * Returns HTTP 400 Bad Request with a map of field names → error messages.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        // Create a Map to accumulate all field-level validation errors.
        Map<String, String> errors = new HashMap<>();

        // Loop through every individual field error in the validation result.
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            // Cast to FieldError to get the specific field name (e.g. "customerEmail").
            String fieldName = ((FieldError) error).getField();
            // Get the message defined in the @NotBlank / @Email / @Min annotation.
            String errorMessage = error.getDefaultMessage();
            // Add to map: e.g. "customerEmail" -> "Invalid email format"
            errors.put(fieldName, errorMessage);
        });

        // Add a general "error" key so the browser knows this is a validation failure.
        errors.put("error", "Validation failed");

        // Return 400 Bad Request with all validation errors as JSON.
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    /**
     * Handles any other Exception not caught above — acts as a safety net.
     * Returns HTTP 500 Internal Server Error so the browser doesn't see a raw stack trace.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        Map<String, String> error = new HashMap<>();
        // Include the exception message for debugging (consider hiding this in production).
        error.put("error", "An unexpected error occurred: " + ex.getMessage());
        // Return 500 Internal Server Error.
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
