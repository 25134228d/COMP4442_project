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

@Service
@RequiredArgsConstructor
public class BookingService {
    
    private final BookingRepository bookingRepository;
    private final PackageRepository packageRepository;
    private final SessionRepository sessionRepository;
    
    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO request) {
        // Fetch package and session
        Long packageId = request.getPackageId();
        if (packageId == null) {
            throw new BusinessException("Package ID cannot be null");
        }
        
        Long sessionId = request.getSessionId();
        if (sessionId == null) {
            throw new BusinessException("Session ID cannot be null");
        }
        
        Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new BusinessException("Package not found with id: " + packageId));
        
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new BusinessException("Session not found with id: " + sessionId));
        
        // Validate seat availability
        Integer availableSeats = session.getAvailableSeats();
        if (availableSeats == null || availableSeats < request.getGuestCount()) {
            int seats = availableSeats != null ? availableSeats : 0;
            throw new BusinessException("Not enough available seats. Only " + seats + " seats left.");
        }
        
        // Check if session date is in the future
        LocalDate sessionDate = session.getSessionDate();
        if (sessionDate == null || sessionDate.isBefore(LocalDate.now())) {
            throw new BusinessException("Cannot book past sessions");
        }
        
        // Calculate total price
        BigDecimal pricePerPerson = pkg.getPricePerPerson();
        if (pricePerPerson == null) {
            throw new BusinessException("Package price is not set");
        }
        
        BigDecimal guestCountDecimal = BigDecimal.valueOf(request.getGuestCount());
        BigDecimal totalPrice = pricePerPerson.multiply(guestCountDecimal);
        
        // Generate unique booking reference
        String bookingReference = generateBookingReference();
        
        // Create booking
        Booking booking = new Booking();
        booking.setBookingReference(bookingReference);
        booking.setPackageObj(pkg);
        booking.setSession(session);
        booking.setCustomerName(request.getCustomerName());
        booking.setCustomerEmail(request.getCustomerEmail());
        booking.setCustomerPhone(request.getCustomerPhone());
        booking.setGuestCount(request.getGuestCount());
        booking.setSpecialRequests(request.getSpecialRequests());
        booking.setTotalPrice(totalPrice);
        booking.setStatus(BookingStatus.CONFIRMED);
        
        // Update available seats
        int currentAvailable = session.getAvailableSeats();
        int newAvailable = currentAvailable - request.getGuestCount();
        session.setAvailableSeats(newAvailable);
        sessionRepository.save(session);
        
        // Save booking
        Booking savedBooking = bookingRepository.save(booking);
        
        return convertToResponseDTO(savedBooking);
    }
    
    public List<BookingResponseDTO> getBookingsByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new BusinessException("Email cannot be empty");
        }
        
        List<Booking> bookings = bookingRepository.findByCustomerEmail(email);
        return bookings.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void cancelBooking(String bookingReference) {
        if (bookingReference == null || bookingReference.trim().isEmpty()) {
            throw new BusinessException("Booking reference cannot be empty");
        }
        
        Booking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(() -> new BusinessException("Booking not found with reference: " + bookingReference));
        
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BusinessException("Booking is already cancelled");
        }
        
        // Return seats to session
        Session session = booking.getSession();
        if (session == null) {
            throw new BusinessException("Session not found for this booking");
        }
        
        int guestCount = booking.getGuestCount();
        int currentAvailable = session.getAvailableSeats();
        
        session.setAvailableSeats(currentAvailable + guestCount);
        sessionRepository.save(session);
        
        // Cancel booking
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }
    
    private String generateBookingReference() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        String randomPart = String.format("%04d", new Random().nextInt(10000));
        return "BKG-" + datePart + "-" + randomPart;
    }
    
    private BookingResponseDTO convertToResponseDTO(Booking booking) {
        if (booking == null) {
            throw new BusinessException("Booking cannot be null");
        }
        
        // Safely get package name
        String packageName = "";
        Package pkg = booking.getPackageObj();
        if (pkg != null && pkg.getName() != null) {
            packageName = pkg.getName();
        }
        
        // Safely get session info
        String sessionLabel = "";
        LocalDate sessionDate = null;
        java.time.LocalTime startTime = null;
        java.time.LocalTime endTime = null;
        
        Session session = booking.getSession();
        if (session != null) {
            sessionLabel = session.getSessionLabel() != null ? session.getSessionLabel() : "";
            sessionDate = session.getSessionDate();
            startTime = session.getStartTime();
            endTime = session.getEndTime();
        }
        
        // Safely get total price
        BigDecimal totalPrice = booking.getTotalPrice();
        BigDecimal price = totalPrice != null ? totalPrice : BigDecimal.ZERO;
        
        // Safely get guest count
        int guestCount = booking.getGuestCount();
        
        // Safely get status
        BookingStatus status = booking.getStatus();
        BookingStatus finalStatus = status != null ? status : BookingStatus.CONFIRMED;
        
        // Safely get createdAt
        String createdAt = "";
        if (booking.getCreatedAt() != null) {
            createdAt = booking.getCreatedAt().toString();
        }
        
        // Safely get other string fields
        String bookingRef = booking.getBookingReference() != null ? booking.getBookingReference() : "";
        String customerName = booking.getCustomerName() != null ? booking.getCustomerName() : "";
        String customerEmail = booking.getCustomerEmail() != null ? booking.getCustomerEmail() : "";
        String customerPhone = booking.getCustomerPhone() != null ? booking.getCustomerPhone() : "";
        String specialRequests = booking.getSpecialRequests();
        
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
                .build();
    }
}