package com.buffetease.server.service;

import com.buffetease.server.domain.UserProfileEntity;
import com.buffetease.server.domain.UserRole;
import com.buffetease.server.dto.LoginResponse;
import com.buffetease.server.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserProfileRepository userProfileRepository;

    @Transactional
    public LoginResponse loginWithEmail(String email) {
        UserProfileEntity profile = userProfileRepository.findByEmail(email)
                .orElseGet(() -> createUserByEmail(email));

        LoginResponse.AuthUser authUser = new LoginResponse.AuthUser(
                profile.getUid(),
                profile.getEmail(),
                profile.getName());

        return new LoginResponse(authUser, profile);
    }

    private UserProfileEntity createUserByEmail(String email) {
        UserProfileEntity user = new UserProfileEntity();
        boolean isAdmin = "admin@test.com".equalsIgnoreCase(email) || "tony107107107@gmail.com".equalsIgnoreCase(email);

        user.setEmail(email);
        user.setName(isAdmin ? "Admin User" : "Customer User");
        user.setRole(isAdmin ? UserRole.ADMIN : UserRole.CUSTOMER);

        return userProfileRepository.save(user);
    }
}
