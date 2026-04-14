package com.comp4442.backend.security;

import com.comp4442.backend.user.UserEntity;
import com.comp4442.backend.user.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {
    private final UserService userService;
    private final JwtService jwtService;
    private final String frontendBaseUrl;

    public OAuth2SuccessHandler(UserService userService, JwtService jwtService,
                                @Value("${app.auth.frontend-base-url}") String frontendBaseUrl) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {
        OAuth2User oauth = (OAuth2User) authentication.getPrincipal();
        UserEntity user = userService.upsertFromGoogle(oauth);
        String jwt = jwtService.generateToken(user.getId(), user.getRole().name(), user.getEmail());
        String redirect = frontendBaseUrl + "/auth/callback?token=" + URLEncoder.encode(jwt, StandardCharsets.UTF_8);
        response.sendRedirect(redirect);
    }
}
