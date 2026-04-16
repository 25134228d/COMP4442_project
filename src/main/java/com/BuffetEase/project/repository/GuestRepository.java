package com.BuffetEase.project.repository;

import com.BuffetEase.project.entity.Guest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface GuestRepository extends JpaRepository<Guest, String> {
    Optional<Guest> findByEmail(String email);
}