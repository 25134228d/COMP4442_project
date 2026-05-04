package com.buffetease.buffet_ease;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * BuffetEaseApplication — the main entry point for the entire Spring Boot application.
 *
 * When you run this class, Spring Boot:
 *   1. Starts an embedded Tomcat web server on port 8080.
 *   2. Scans and registers all @Controller, @Service, @Repository beans automatically.
 *   3. Connects to the MySQL database using settings in application.properties.
 */

// @SpringBootApplication combines three annotations:
//   @Configuration      — marks this class as a source of bean definitions
//   @EnableAutoConfiguration — lets Spring Boot auto-configure libraries (JPA, Web, etc.)
//   @ComponentScan      — scans the current package (and sub-packages) for Spring components
@SpringBootApplication
public class BuffetEaseApplication {

    // The main() method is the standard Java entry point — Java always starts here.
    public static void main(String[] args) {
        // SpringApplication.run() boots the entire application:
        //   - starts the embedded web server
        //   - initialises all beans (controllers, services, repositories)
        //   - connects to the database
        SpringApplication.run(BuffetEaseApplication.class, args);

        // Print startup confirmation messages to the console so we know the server is up.
        System.out.println(" BuffetEase Backend is running on http://localhost:8080");
        System.out.println(" Access the application at http://localhost:8080");
        System.out.println(" API endpoints available at http://localhost:8080/api/...");
    }
}