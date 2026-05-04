package com.buffetease.buffet_ease.service;

import com.buffetease.buffet_ease.dto.BookingRequestDTO;
import com.buffetease.buffet_ease.dto.BookingResponseDTO;
import com.buffetease.buffet_ease.exception.BusinessException;
import com.buffetease.buffet_ease.model.Booking;
import com.buffetease.buffet_ease.model.Package;
import com.buffetease.buffet_ease.model.Session;
import com.buffetease.buffet_ease.model.enums.BookingStatus;
import com.buffetease.buffet_ease.repository.BookingRepository;
import com.buffetease.buffet_ease.repository.PackageRepository;
import com.buffetease.buffet_ease.repository.SessionRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

/**
 * BookingService — the main business logic layer for all booking operations.
 *
 * This class handles three core actions:
 *   1. createBooking  — validates, calculates price, generates reference, saves to DB.
 *   2. getBookingsByEmail — retrieves all bookings for a customer's email.
 *   3. cancelBooking  — marks a booking as CANCELLED and restores seats.
 *
 * @Service — registers this class as a Spring service bean (can be injected into controllers).
 * @RequiredArgsConstructor (Lombok) — generates a constructor that injects the three repositories.
 */
@Service
@RequiredArgsConstructor
public class BookingService {

    // ─── Injected Repositories (Spring provides these via constructor injection) ──────

    private final BookingRepository bookingRepository;     // Access to the "bookings" table.
    private final PackageRepository packageRepository;     // Access to the "packages" table.
    private final SessionRepository sessionRepository;     // Access to the "sessions" table.

    // ═══════════════════════════════════════════════════════════════════════════════════
    // PUBLIC METHOD 1: Create a new booking
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * Creates a new booking after running all business rule validations.
     * @Transactional — if any step fails (e.g. DB error), ALL database changes are rolled back
     *                  so we never end up with a booking saved but seats not reduced (or vice versa).
     */
    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO request) {

        // ── Step 1: Extract and validate IDs from the request ──────────────────────────
        Long packageId = request.getPackageId();
        if (packageId == null) {
            throw new BusinessException("Package ID cannot be null"); // Extra safety check.
        }

        Long sessionId = request.getSessionId();
        if (sessionId == null) {
            throw new BusinessException("Session ID cannot be null");
        }

        // ── Step 2: Load the Package from the database ─────────────────────────────────
        // findById returns Optional<Package>; orElseThrow throws BusinessException if not found.
        Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new BusinessException("Package not found with id: " + packageId));

        // ── Step 3: Load the Session from the database ─────────────────────────────────
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new BusinessException("Session not found with id: " + sessionId));

        // ── Step 4: Check seat availability ────────────────────────────────────────────
        Integer availableSeats = session.getAvailableSeats();
        // Reject if there are no seats or fewer seats than the requested guest count.
        if (availableSeats == null || availableSeats < request.getGuestCount()) {
            int seats = availableSeats != null ? availableSeats : 0;
            throw new BusinessException("Not enough available seats. Only " + seats + " seats left.");
        }

        // ── Step 5: Ensure the session has not already passed ──────────────────────────
        LocalDate sessionDate = session.getSessionDate();
        // isBefore(LocalDate.now()) is true if the session date is in the past.
        if (sessionDate == null || sessionDate.isBefore(LocalDate.now())) {
            throw new BusinessException("Cannot book past sessions");
        }

        // ── Step 6: Calculate the total price ──────────────────────────────────────────
        BigDecimal pricePerPerson = pkg.getPricePerPerson();
        if (pricePerPerson == null) {
            throw new BusinessException("Package price is not set");
        }
        // Convert guestCount (Integer) to BigDecimal so we can use BigDecimal.multiply().
        BigDecimal guestCountDecimal = BigDecimal.valueOf(request.getGuestCount());
        BigDecimal totalPrice = pricePerPerson.multiply(guestCountDecimal); // e.g. 388.00 × 2 = 776.00

        // ── Step 7: Generate a unique booking reference ─────────────────────────────────
        // Calls the private helper method below. Result e.g. "BKG-260504-7823".
        String bookingReference = generateBookingReference();

        // ── Step 8: Build the Booking entity and populate all fields ───────────────────
        Booking booking = new Booking();
        booking.setBookingReference(bookingReference);
        booking.setPackageObj(pkg);                              // Link to the Package entity.
        booking.setSession(session);                             // Link to the Session entity.
        booking.setCustomerName(request.getCustomerName());
        booking.setCustomerEmail(request.getCustomerEmail());
        booking.setCustomerPhone(request.getCustomerPhone());
        booking.setGuestCount(request.getGuestCount());
        booking.setSpecialRequests(request.getSpecialRequests()); // May be null — that's fine.
        booking.setTotalPrice(totalPrice);
        booking.setStatus(BookingStatus.CONFIRMED);              // New bookings are always CONFIRMED.

        // ── Step 9: Reduce the available seats in the session ──────────────────────────
        int currentAvailable = session.getAvailableSeats();
        int newAvailable = currentAvailable - request.getGuestCount(); // Deduct reserved seats.
        session.setAvailableSeats(newAvailable);
        sessionRepository.save(session); // UPDATE the session row in the DB.

        // ── Step 10: Save the booking to the database ──────────────────────────────────
        Booking savedBooking = bookingRepository.save(booking); // INSERT the booking row.

        // ── Step 11: Convert the saved entity to a DTO and return it ───────────────────
        return convertToResponseDTO(savedBooking);
    }

    // ═══════════════════════════════════════════════════════════════════════════════════
    // PUBLIC METHOD 2: Get all bookings by customer email
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * Returns all bookings for a given email address (used by the "My Bookings" page).
     * No @Transactional needed — this is a read-only operation.
     */
    public List<BookingResponseDTO> getBookingsByEmail(String email) {
        // Basic null/empty check before hitting the database.
        if (email == null || email.trim().isEmpty()) {
            throw new BusinessException("Email cannot be empty");
        }

        // Query the DB: SELECT * FROM bookings WHERE customer_email = email
        List<Booking> bookings = bookingRepository.findByCustomerEmail(email);

        // Convert each Booking entity to a BookingResponseDTO using a method reference.
        // .stream()  — turn the List into a Stream for functional-style processing.
        // .map(...)  — apply convertToResponseDTO to each Booking in the stream.
        // .collect() — gather the results back into a new List.
        return bookings.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════════════════════════════════
    // PUBLIC METHOD 3: Cancel a booking
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * Cancels a booking by its reference string and returns the seats to the session.
     * @Transactional — ensures both the seat update and the booking status update are atomic.
     */
    @Transactional
    public void cancelBooking(String bookingReference) {
        // Guard against empty or null reference strings.
        if (bookingReference == null || bookingReference.trim().isEmpty()) {
            throw new BusinessException("Booking reference cannot be empty");
        }

        // Fetch the booking by its unique reference string; throw if not found.
        Booking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new BusinessException("Booking not found with reference: " + bookingReference));

        // Prevent double-cancellation — if already CANCELLED, reject the request.
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BusinessException("Booking is already cancelled");
        }

        // ── Step 1: Return the seats to the session ────────────────────────────────────
        Session session = booking.getSession();
        if (session == null) {
            throw new BusinessException("Session not found for this booking");
        }

        int guestCount = booking.getGuestCount();           // How many seats to restore.
        int currentAvailable = session.getAvailableSeats(); // Current available seats.

        // Add the cancelled guests' seats back to the session.
        session.setAvailableSeats(currentAvailable + guestCount);
        sessionRepository.save(session); // UPDATE the session row in the DB.

        // ── Step 2: Mark the booking as CANCELLED ──────────────────────────────────────
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking); // UPDATE the booking row in the DB.
        // @PreUpdate in Booking.java automatically updates the updatedAt timestamp.
    }

    // ═══════════════════════════════════════════════════════════════════════════════════
    // PRIVATE HELPER: Generate a unique booking reference
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * Generates a human-readable booking reference in the format: BKG-YYMMDD-XXXX
     * Example: "BKG-260504-7823"
     *   BKG     — prefix identifying this as a booking
     *   260504  — today's date (year 2026, month 05, day 04)
     *   7823    — 4-digit random number to make each reference unique within the same day
     */
    private String generateBookingReference() {
        // Format today's date as "yyMMdd" (2-digit year, 2-digit month, 2-digit day).
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        // Generate a random integer between 0 and 9999, then zero-pad to 4 digits (e.g. 7 → "0007").
        String randomPart = String.format("%04d", new Random().nextInt(10000));
        return "BKG-" + datePart + "-" + randomPart;
    }

    // ═══════════════════════════════════════════════════════════════════════════════════
    // PRIVATE HELPER: Convert a Booking entity to a BookingResponseDTO
    // ═══════════════════════════════════════════════════════════════════════════════════

    /**
     * Converts a Booking JPA entity into a BookingResponseDTO safe for returning as JSON.
     * Defensive null checks are included for every field to prevent NullPointerExceptions
     * if any optional data (package, session, price, etc.) is missing.
     */
    private BookingResponseDTO convertToResponseDTO(Booking booking) {
        if (booking == null) {
            throw new BusinessException("Booking cannot be null");
        }

        // ── Safely extract package name ────────────────────────────────────────────────
        // packageObj is LAZY loaded — it may not be loaded yet; check for null.
        String packageName = "";
        Package pkg = booking.getPackageObj();
        if (pkg != null && pkg.getName() != null) {
            packageName = pkg.getName(); // e.g. "Signature Dinner Buffet"
        }

        // ── Safely extract session information ────────────────────────────────────────
        String sessionLabel = "";
        LocalDate sessionDate = null;
        java.time.LocalTime startTime = null;
        java.time.LocalTime endTime = null;

        Session session = booking.getSession();
        if (session != null) {
            // Ternary operator: if sessionLabel is not null use it, otherwise use "".
            sessionLabel = session.getSessionLabel() != null ? session.getSessionLabel() : "";
            sessionDate = session.getSessionDate();   // e.g. 2026-05-10
            startTime = session.getStartTime();       // e.g. 18:00
            endTime = session.getEndTime();           // e.g. 20:30
        }

        // ── Safely extract total price ────────────────────────────────────────────────
        BigDecimal totalPrice = booking.getTotalPrice();
        BigDecimal price = totalPrice != null ? totalPrice : BigDecimal.ZERO; // Default to 0 if missing.

        // ── Safely extract guest count ────────────────────────────────────────────────
        int guestCount = booking.getGuestCount();

        // ── Safely extract status ─────────────────────────────────────────────────────
        BookingStatus status = booking.getStatus();
        BookingStatus finalStatus = status != null ? status : BookingStatus.CONFIRMED;

        // ── Safely extract createdAt timestamp ────────────────────────────────────────
        String createdAt = "";
        if (booking.getCreatedAt() != null) {
            createdAt = booking.getCreatedAt().toString(); // Convert LocalDateTime to ISO-8601 string.
        }

        // ── Safely extract customer string fields ─────────────────────────────────────
        String bookingRef = booking.getBookingReference() != null ? booking.getBookingReference() : "";
        String customerName = booking.getCustomerName() != null ? booking.getCustomerName() : "";
        String customerEmail = booking.getCustomerEmail() != null ? booking.getCustomerEmail() : "";
        String customerPhone = booking.getCustomerPhone() != null ? booking.getCustomerPhone() : "";
        String specialRequests = booking.getSpecialRequests(); // Allowed to be null.

        // ── Build and return the DTO using the @Builder pattern ───────────────────────
        // BookingResponseDTO.builder() creates a builder; .build() constructs the object.
        return BookingResponseDTO.builder()
                .id(booking.getId())
                .bookingReference(bookingRef)
                .packageName(packageName)
                .sessionLabel(sessionLabel)
                .sessionDate(sessionDate)
                .startTime(startTime)
                .endTime(endTime)
                .customerName(customerName)
                .customerEmail(customerEmail)
                .customerPhone(customerPhone)
                .guestCount(guestCount)
                .specialRequests(specialRequests)
                .totalPrice(price)
                .status(finalStatus)
                .createdAt(createdAt)
                .build(); // Constructs the final BookingResponseDTO object.
    }
}
