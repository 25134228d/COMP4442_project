package com.comp4442.backend.user;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserEntity, String> {
    Optional<UserEntity> findByEmailIgnoreCase(String email);
    Optional<UserEntity> findByGoogleSub(String googleSub);
}
