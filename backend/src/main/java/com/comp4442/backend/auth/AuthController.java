package com.comp4442.backend.auth;

import com.comp4442.backend.common.Mappers;
import com.comp4442.backend.security.UserPrincipal;
import com.comp4442.backend.user.UserService;
import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AuthController {
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/auth/me")
    public Object me(@AuthenticationPrincipal UserPrincipal principal) {
        return Mappers.toUserProfile(userService.getById(principal.getId()));
    }

    @GetMapping("/public/config")
    public Map<String, String> config() {
        return Map.of("oauthStart", "/oauth2/authorization/google");
    }
}
