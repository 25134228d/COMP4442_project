package com.BuffetEase.project.service;

import com.BuffetEase.project.entity.Guest;
import com.BuffetEase.project.repository.GuestRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class GuestService {

    private final GuestRepository guestRepository;

    public GuestService(GuestRepository guestRepository) {
        this.guestRepository = guestRepository;
    }

    public Guest createGuest(Guest guest) {
        return guestRepository.save(guest);
    }

    public Optional<Guest> getGuestById(String id) {
        return guestRepository.findById(id);
    }

    public Optional<Guest> getGuestByEmail(String email) {
        return guestRepository.findByEmail(email);
    }

    public List<Guest> getAllGuests() {
        return guestRepository.findAll();
    }

    public Guest updateGuest(String id, Guest guestDetails) {
        return guestRepository.findById(id).map(guest -> {
            guest.setName(guestDetails.getName());
            guest.setEmail(guestDetails.getEmail());
            guest.setPhone(guestDetails.getPhone());
            return guestRepository.save(guest);
        }).orElseThrow(() -> new RuntimeException("Guest not found"));
    }

    public void deleteGuest(String id) {
        if (!guestRepository.existsById(id)) {
            throw new RuntimeException("Guest not found");
        }
        guestRepository.deleteById(id);
    }
}