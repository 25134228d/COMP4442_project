package com.buffetease.buffet_ease;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BuffetEaseApplication {
    public static void main(String[] args) {
        SpringApplication.run(BuffetEaseApplication.class, args);
        System.out.println(" BuffetEase Backend is running on http://localhost:8080");
        System.out.println(" Access the application at http://localhost:8080");
        System.out.println(" API endpoints available at http://localhost:8080/api/...");
    }
}