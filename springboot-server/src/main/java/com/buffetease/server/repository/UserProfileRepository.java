package com.buffetease.server.repository;

import com.buffetease.server.domain.UserProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserProfileRepository extends JpaRepository<UserProfileEntity, String> {
    Optional<UserProfileEntity> findByEmail(String email);
}
