package com.buffetease.buffet_ease.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CorsConfig — Cross-Origin Resource Sharing (CORS) configuration.
 *
 * Problem: Browsers block JavaScript on one domain from calling an API on a different
 * domain by default (a security rule called the "Same-Origin Policy").
 *
 * Solution: This class tells Spring Boot which origins (domains/IPs) are allowed
 * to call our REST API. Without this, the browser would refuse to load the data
 * and show a CORS error in the developer console.
 */

// @Configuration tells Spring this class contains configuration settings (not business logic).
@Configuration
// Implementing WebMvcConfigurer lets us customise Spring MVC behaviour (e.g. CORS rules).
public class CorsConfig implements WebMvcConfigurer {

    // @Override means we are replacing the default (empty) implementation of addCorsMappings.
    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        // Apply CORS rules only to paths that start with /api/
        // (Static files like index.html are served directly and don't need CORS).
        registry.addMapping("/api/**")
                // Only allow requests from this specific IP address (our AWS EC2 server).
                // Change this to "*" during local development to allow all origins.
                .allowedOrigins("http://54.254.174.73")
                // List every HTTP method the browser is allowed to use when calling the API.
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                // Allow any request header (e.g. Content-Type, Authorization).
                .allowedHeaders("*")
                // We don't use cookies or sessions, so credentials are set to false.
                .allowCredentials(false)
                // Cache the CORS "pre-flight" check result for 1 hour (3600 seconds)
                // so the browser doesn't need to ask again on every API call.
                .maxAge(3600);
    }
}