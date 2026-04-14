package com.comp4442.backend.user;

import com.comp4442.backend.common.ApiException;
import com.comp4442.backend.common.Enums.UserRole;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final Set<String> adminEmails;

    public UserService(UserRepository userRepository, @Value("${app.auth.admin-emails:}") String adminEmailsRaw) {
        this.userRepository = userRepository;
        this.adminEmails = Arrays.stream(adminEmailsRaw.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(s -> !s.isBlank())
                .collect(Collectors.toSet());
    }

    @Transactional
    public UserEntity upsertFromGoogle(OAuth2User oAuth2User) {
        String sub = (String) oAuth2User.getAttributes().get("sub");
        String email = (String) oAuth2User.getAttributes().get("email");
        String name = (String) oAuth2User.getAttributes().get("name");

        if (email == null || name == null || sub == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Google profile missing required fields");
        }

        UserEntity user = userRepository.findByGoogleSub(sub)
                .or(() -> userRepository.findByEmailIgnoreCase(email))
                .orElseGet(UserEntity::new);

        user.setGoogleSub(sub);
        user.setEmail(email.toLowerCase());
        user.setName(name);
        user.setRole(adminEmails.contains(user.getEmail()) ? UserRole.ADMIN : UserRole.CUSTOMER);
        return userRepository.save(user);
    }

    public UserEntity getById(String id) {
        return userRepository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}
