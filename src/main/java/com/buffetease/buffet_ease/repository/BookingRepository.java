package com.buffetease.buffet_ease.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.buffetease.buffet_ease.model.Booking;
import com.buffetease.buffet_ease.model.enums.BookingStatus;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    List<Booking> findByCustomerEmail(String email);
    
    Optional<Booking> findByBookingReference(String bookingReference);
    
    List<Booking> findByCustomerEmailAndStatus(String email, BookingStatus status);
}