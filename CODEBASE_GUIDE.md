# BuffetEase – Codebase Guide

> A quick reference for the demo. Explains **every file** and **what it does**.

---

## 🗂️ Project Overview

**BuffetEase** is a buffet restaurant booking web application for a Hong Kong restaurant.

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3, Spring Data JPA |
| Database | MySQL |
| Frontend | Plain HTML + JavaScript + Tailwind CSS |
| Build Tool | Maven (`pom.xml`) |

The app follows a classic **3-tier architecture**:

```
Browser (HTML pages)
       ↓  HTTP requests
  Controllers  (REST API)
       ↓
   Services    (business logic)
       ↓
 Repositories  (database queries)
       ↓
    MySQL DB
```

---

## 📁 Root-Level Files

| File | What it does |
|---|---|
| `pom.xml` | Maven build file. Lists all Java dependencies (Spring Boot, MySQL driver, Lombok, Validation) and tells Maven how to compile & package the project. |
| `mvnw` / `mvnw.cmd` | Maven wrapper scripts. Let you run Maven commands (`./mvnw spring-boot:run`) without installing Maven globally. Unix = `mvnw`, Windows = `mvnw.cmd`. |
| `schma.sql` | SQL script to **set up the database from scratch**. Creates all 4 tables, adds sample packages, sessions, bookings, and contact messages. Run this once to initialise the DB. |
| `README.md` | Basic project readme. |
| `.gitignore` | Tells Git which files to ignore (e.g. compiled `.class` files, IDE settings). |

---

## 🚀 Application Entry Point

### `src/main/java/com/buffetease/buffet_ease/BuffetEaseApplication.java`

The **main class** that starts the entire Spring Boot application.

- Annotated with `@SpringBootApplication` → tells Spring to auto-configure and scan all components.
- The `main()` method calls `SpringApplication.run(...)` which boots the embedded web server on **port 8080**.
- Prints startup messages to the console (e.g. "BuffetEase Backend is running").

---

## ⚙️ Configuration

### `src/main/java/com/buffetease/buffet_ease/config/CorsConfig.java`

**CORS (Cross-Origin Resource Sharing) configuration.**

- Prevents browser security errors when the frontend calls the API.
- Allows HTTP requests from the EC2 server IP (`http://54.254.174.73`) to reach all `/api/**` endpoints.
- Permits standard HTTP methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`.

### `src/main/resources/application.properties`

**Application settings file** (loaded automatically by Spring Boot on startup).

| Setting | Purpose |
|---|---|
| `server.port=8080` | App runs on port 8080 |
| `spring.datasource.url` | MySQL connection string (database = `buffetease_db`, timezone = Hong Kong) |
| `spring.datasource.username/password` | DB credentials (read from environment variables `DB_USERNAME` / `DB_PASSWORD`; defaults to `admin` / `admin123`) |
| `spring.jpa.hibernate.ddl-auto=validate` | JPA checks that the DB schema matches the entity classes (does NOT auto-create tables; use `schma.sql` for that) |
| `spring.jpa.show-sql=true` | Prints every SQL query to the console (useful for debugging) |

---

## 🌐 Controllers — The REST API

Controllers receive HTTP requests from the browser and return JSON responses.

---

### `controller/BookingController.java`

**API endpoint base path: `/api/bookings`**

Handles everything related to customer reservations.

| Method | URL | What it does |
|---|---|---|
| `POST` | `/api/bookings` | **Create a new booking.** Receives booking form data, saves to DB, returns a booking reference number (e.g. `BKG-260504-1234`). |
| `GET` | `/api/bookings/email/{email}` | **Look up all bookings by email.** Used on the "My Bookings" page when a customer enters their email. |
| `PUT` | `/api/bookings/{reference}/cancel` | **Cancel a booking.** Marks the booking as CANCELLED and restores the seats back to the session. |

---

### `controller/PackageController.java`

**API endpoint base path: `/api/packages`**

Handles the buffet dining packages and their available time slots.

| Method | URL | What it does |
|---|---|---|
| `GET` | `/api/packages` | **Get all packages.** Returns the full list of buffet options (Signature Dinner, Weekend Brunch, etc.) |
| `GET` | `/api/packages/{id}` | **Get one package by ID.** Returns details for a single package. |
| `GET` | `/api/packages/{id}/sessions` | **Get time slots for a package.** Returns only *upcoming* sessions (today or future), sorted by date/time. |

---

### `controller/ContactController.java`

**API endpoint base path: `/api/contact`**

Handles the "Contact Us" form on the About page.

| Method | URL | What it does |
|---|---|---|
| `POST` | `/api/contact` | **Save a customer message.** Validates name, email, and message fields, then saves to the `contact_messages` table in the DB. |

---

## 🧠 Services — Business Logic

Services contain the actual business rules. Controllers call services; services call repositories.

---

### `service/BookingService.java`

The most complex service. Handles the full booking lifecycle.

| Method | What it does |
|---|---|
| `createBooking(request)` | Validates the package & session exist → checks there are enough seats → checks the session date is in the future → calculates total price (`pricePerPerson × guestCount`) → generates a unique booking reference like `BKG-260504-7823` → saves the booking → **decrements available seats** in the session. |
| `getBookingsByEmail(email)` | Fetches all bookings for a given email address. |
| `cancelBooking(reference)` | Finds the booking by reference → throws an error if already cancelled → **adds the seats back** to the session → marks booking status as `CANCELLED`. |
| `generateBookingReference()` | Private helper. Creates a reference like `BKG-YYMMDD-XXXX` (date + 4 random digits). |
| `convertToResponseDTO(booking)` | Private helper. Converts a `Booking` entity into a `BookingResponseDTO` safe to return as JSON. |

---

### `service/PackageService.java`

Handles reading package and session data.

| Method | What it does |
|---|---|
| `getAllPackages()` | Fetches all packages from DB and converts each to a `PackageResponseDTO`. |
| `getPackageById(id)` | Fetches one package by ID; throws `BusinessException` if not found. |
| `getSessionsByPackageId(packageId)` | Validates the package exists, then returns only **upcoming** sessions (using a custom DB query that filters past dates). |

---

### `service/ContactService.java`

Simple service with one job.

| Method | What it does |
|---|---|
| `saveContactMessage(request)` | Converts the contact form data into a `ContactMessage` entity and saves it to the database. |

---

## 🗃️ Models — Database Table Definitions

Models (entities) map directly to MySQL database tables using JPA/Hibernate annotations.

---

### `model/Package.java` → Table: `packages`

Represents a buffet dining package.

| Field | Type | Description |
|---|---|---|
| `id` | Long | Auto-generated primary key |
| `name` | String | Package name (e.g. "Signature Dinner Buffet") |
| `type` | String | Category (e.g. "Dinner", "Brunch", "Chinese") |
| `description` | Text | Long description shown on the packages page |
| `pricePerPerson` | BigDecimal | Price per guest (e.g. 388.00) |
| `imageUrl` | String | URL of the package photo |
| `sessions` | List\<Session\> | One package has many sessions (one-to-many relationship) |

---

### `model/Session.java` → Table: `sessions`

Represents a specific time slot for a package on a particular date.

| Field | Type | Description |
|---|---|---|
| `id` | Long | Auto-generated primary key |
| `packageObj` | Package | Which package this slot belongs to (many-to-one) |
| `sessionLabel` | String | Human-readable label (e.g. "Early Dinner (6:00 PM)") |
| `sessionDate` | LocalDate | The date of the session |
| `startTime` / `endTime` | LocalTime | Start and end times |
| `totalSeats` | Integer | Maximum capacity |
| `availableSeats` | Integer | Remaining seats (decreases when booked, increases when cancelled) |

---

### `model/Booking.java` → Table: `bookings`

Represents a customer reservation.

| Field | Type | Description |
|---|---|---|
| `id` | Long | Auto-generated primary key |
| `bookingReference` | String | Unique human-readable reference (e.g. `BKG-260504-1234`) |
| `packageObj` | Package | Which package was booked |
| `session` | Session | Which time slot was booked |
| `customerName/Email/Phone` | String | Customer contact details |
| `guestCount` | Integer | Number of guests (1–20) |
| `specialRequests` | Text | Optional dietary / special requests |
| `totalPrice` | BigDecimal | `pricePerPerson × guestCount` |
| `status` | BookingStatus | Either `CONFIRMED` or `CANCELLED` |
| `createdAt` / `updatedAt` | LocalDateTime | Auto-set on save/update via `@PrePersist` / `@PreUpdate` |

---

### `model/ContactMessage.java` → Table: `contact_messages`

Stores messages submitted via the Contact Us form.

| Field | Type | Description |
|---|---|---|
| `id` | Long | Auto-generated primary key |
| `name` / `email` | String | Sender's name and email |
| `message` | Text | The message content |
| `isRead` | Boolean | Whether an admin has read it (defaults to `false`) |
| `createdAt` | LocalDateTime | Auto-set on save |

---

### `model/enums/BookingStatus.java`

A simple **enum** (fixed set of values) for booking state.

```
CONFIRMED  →  Active booking
CANCELLED  →  Booking has been cancelled
```

---

## 📦 DTOs — Data Transfer Objects

DTOs are plain data containers used to safely move data between the API and the outside world. They prevent exposing internal model details.

| File | Direction | What it contains |
|---|---|---|
| `BookingRequestDTO.java` | **Incoming** (from browser) | The booking form fields: packageId, sessionId, customerName, customerEmail, customerPhone, guestCount, specialRequests. All fields have validation rules (`@NotBlank`, `@Email`, `@Min`, `@Max`, etc.). |
| `BookingResponseDTO.java` | **Outgoing** (to browser) | Full booking details returned after creation or lookup: reference number, package name, session date/time, customer info, total price, status. |
| `ContactRequestDTO.java` | **Incoming** (from browser) | Contact form fields: name, email, message (all required, email must be valid format). |
| `PackageResponseDTO.java` | **Outgoing** (to browser) | Package data: id, name, type, description, pricePerPerson, imageUrl. |
| `SessionResponseDTO.java` | **Outgoing** (to browser) | Session data: id, sessionLabel, date, startTime, endTime, availableSeats, totalSeats. |

---

## 🗄️ Repositories — Database Queries

Repositories extend `JpaRepository` which gives free basic operations (`findAll`, `findById`, `save`, `delete`). Custom query methods are added as needed.

| File | Table | Custom queries |
|---|---|---|
| `BookingRepository.java` | `bookings` | `findByCustomerEmail(email)` – all bookings for an email. `findByBookingReference(ref)` – one booking by reference. `findByCustomerEmailAndStatus(email, status)` – filter by email + status. |
| `PackageRepository.java` | `packages` | None (uses only built-in JPA methods). |
| `SessionRepository.java` | `sessions` | `findByPackageObjId(packageId)` – all sessions for a package. `findUpcomingSessionsByPackageId(packageId)` – only future sessions, sorted by date and time (uses a custom `@Query` annotation with JPQL). |
| `ContactMessageRepository.java` | `contact_messages` | None (uses only built-in JPA methods). |

---

## ⚠️ Exception Handling

### `exception/BusinessException.java`

A **custom exception class** for expected business rule violations (e.g. "not enough seats", "booking not found").  
Extends `RuntimeException` so it can be thrown anywhere without needing `try-catch` blocks.

### `exception/GlobalExceptionHandler.java`

A **global error handler** (annotated with `@RestControllerAdvice`) that catches exceptions thrown anywhere in the application and converts them into clean JSON error responses.

| Exception caught | HTTP Status returned | What triggers it |
|---|---|---|
| `BusinessException` | `400 Bad Request` | Booking fails validation (no seats, past date, etc.) |
| `MethodArgumentNotValidException` | `400 Bad Request` | Form field validation fails (blank name, bad email, etc.) — returns a list of which fields failed and why |
| Any other `Exception` | `500 Internal Server Error` | Unexpected server errors |

---

## 🖥️ Frontend — HTML Pages

All 4 pages share the same **olive-green (`#4a7043`)** brand theme, **Playfair Display** serif font, and navigation bar. They use **Tailwind CSS** (loaded from CDN) for styling and plain JavaScript to call the backend API.

---

### `static/index.html` — Home Page

**URL:** `http://localhost:8080/` or `http://localhost:8080/index.html`

- Full-screen **hero section** with a food background image, headline "A Symphony of Flavors", and a button linking to Packages.
- Three feature cards: Premium Selection, Expert Chefs, Memorable Experience.
- Final call-to-action section linking to Packages.
- No API calls — fully static content.

---

### `static/packages.html` — Packages & Booking Page

**URL:** `http://localhost:8080/packages.html`

The most interactive page. Handles the full booking flow.

| Step | What happens |
|---|---|
| 1. Page loads | JavaScript calls `GET /api/packages` and renders a card grid with all packages (image, name, type, price, description). |
| 2. Click "Book Now" | A modal (popup) appears. JavaScript calls `GET /api/packages/{id}/sessions` to load available time slots into a dropdown. |
| 3. Fill the form | Customer enters name, email, phone, number of guests, optional special requests. |
| 4. Submit | JavaScript calls `POST /api/bookings` with the form data. On success, shows a confirmation popup with the booking reference number. On error, shows the error message. |

Key JavaScript functions in this file:
- `loadPackages()` – fetches and renders package cards
- `openBookingModal(pkg)` – opens booking popup and loads sessions
- `loadSessions(packageId)` – fetches available time slots
- `submitBooking()` – validates and sends the booking request
- `showMessage(type, title, message)` – shows success/error popups

---

### `static/my-bookings.html` — My Bookings Page

**URL:** `http://localhost:8080/my-bookings.html`

Allows customers to look up and manage their bookings by email.

| Step | What happens |
|---|---|
| 1. Enter email | Customer types their email and clicks Search. |
| 2. Search | JavaScript calls `GET /api/bookings/email/{email}`. Displays all bookings as cards (confirmed = green badge, cancelled = red badge). |
| 3. Cancel | Customer clicks "Cancel Reservation" on a confirmed booking. A confirmation modal appears. On confirm, JavaScript calls `PUT /api/bookings/{reference}/cancel`. The page refreshes the booking list. |

Key JavaScript functions:
- `searchBookings()` – calls the API and renders booking cards
- `showCancelModal(ref)` – shows cancel confirmation popup
- `confirmCancel()` – sends the cancel request to the API

---

### `static/about.html` — About Us Page

**URL:** `http://localhost:8080/about.html`

A 3-tab informational and contact page.

| Tab | Content |
|---|---|
| **Our Story** | Restaurant background story, founding year, mission, and a gallery of food photos. |
| **Our Team** | Cards for team members (Head Chef, Manager, etc.) with photos and descriptions. |
| **Contact Us** | A contact form (name, email, message). On submit, JavaScript calls `POST /api/contact` to save the message. Shows success/error popup. |

Key JavaScript functions:
- `switchTab(index)` – switches between the 3 tabs
- `submitContact()` – validates and sends contact form to the API
- `showMessage(type, title, message)` – reusable popup for feedback

---

## 🗃️ Database Schema (`schma.sql`)

Four tables, related as shown:

```
packages  ──< sessions  ──< bookings
                                 ↑
                          (references sessions & packages)

contact_messages  (standalone, no foreign keys)
```

- One **package** can have many **sessions** (time slots).
- One **session** can have many **bookings**.
- Each **booking** references exactly one package and one session.
- **contact_messages** is independent.

---

## 🧪 Test File

### `src/test/java/com/buffetease/buffet_ease/BuffetEaseApplicationTests.java`

Basic Spring Boot smoke test. Verifies that the application context loads without errors. Run with `./mvnw test`.

---

## 🔄 How a Booking Works — End to End

```
1. Browser opens packages.html
2. JS calls GET /api/packages  →  PackageController → PackageService → PackageRepository → MySQL
3. Packages rendered as cards

4. User clicks "Book Now"
5. JS calls GET /api/packages/{id}/sessions  →  only future sessions returned

6. User fills form and clicks Submit
7. JS calls POST /api/bookings  with JSON body
8. BookingController receives request, validates with @Valid
9. BookingService:
   a. Checks package & session exist
   b. Checks enough seats available
   c. Checks session date is in the future
   d. Calculates total price
   e. Generates unique booking reference
   f. Saves booking to DB
   g. Reduces available seats in the session
10. Returns JSON with bookingReference, booking details, success message
11. Browser shows confirmation popup with reference number
```

---

*Generated for COMP4442 Project Demo*
