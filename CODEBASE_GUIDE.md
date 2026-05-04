# BuffetEase 系統代碼詳解 / BuffetEase Codebase Guide

> 中英對照詳細說明文件 | Bilingual Detailed Technical Reference  
> 適用於 Demo 準備 | Prepared for Demo Presentation  
> 項目名稱 / Project: **BuffetEase** — 香港自助餐訂座系統 / HK Buffet Reservation System

---

## 目錄 / Table of Contents

1. [整體架構 / Overall Architecture](#1-整體架構--overall-architecture)
2. [技術棧 / Tech Stack](#2-技術棧--tech-stack)
3. [資料庫設計 / Database Design](#3-資料庫設計--database-design-schmasql)
4. [後端 (Backend) — Spring Boot](#4-後端-backend--spring-boot)
   - [進入點 / Entry Point](#41-進入點--entry-point--buffeteaseapplicationjava)
   - [配置 / Config](#42-配置--config--corsconfigjava)
   - [資料模型 / Models](#43-資料模型--models)
   - [資料傳輸物件 / DTOs](#44-資料傳輸物件--dtos)
   - [資料庫存取 / Repositories](#45-資料庫存取--repositories)
   - [業務邏輯 / Services](#46-業務邏輯--services)
   - [API 控制器 / Controllers](#47-api-控制器--controllers)
   - [例外處理 / Exception Handling](#48-例外處理--exception-handling)
5. [前端 (Frontend) — HTML + JavaScript](#5-前端-frontend--html--javascript)
   - [首頁 / Homepage](#51-首頁--homepage--indexhtml)
   - [套餐頁 / Packages Page](#52-套餐頁--packages-page--packageshtml)
   - [我的預訂 / My Bookings](#53-我的預訂--my-bookings--my-bookingshtml)
   - [關於我們 / About Page](#54-關於我們--about-page--abouthtml)
6. [API 端點總覽 / API Endpoints Summary](#6-api-端點總覽--api-endpoints-summary)
7. [完整數據流程圖 / Full Data Flow](#7-完整數據流程圖--full-data-flow)

---

## 1. 整體架構 / Overall Architecture

```
BuffetEase (Spring Boot Monolith)
│
├── 前端 / Frontend  ← src/main/resources/static/
│   ├── index.html          (首頁 / Homepage)
│   ├── packages.html       (套餐列表 + 預訂功能 / Packages + Booking)
│   ├── my-bookings.html    (查看 & 取消預訂 / View & Cancel Bookings)
│   └── about.html          (關於我們 + 聯絡表格 / About + Contact Form)
│
└── 後端 / Backend   ← src/main/java/com/buffetease/buffet_ease/
    ├── BuffetEaseApplication.java   (啟動類 / Entry Point)
    ├── config/
    │   └── CorsConfig.java          (跨域配置 / CORS)
    ├── controller/                   (API 端點 / REST Endpoints)
    │   ├── PackageController.java
    │   ├── BookingController.java
    │   └── ContactController.java
    ├── service/                      (業務邏輯 / Business Logic)
    │   ├── PackageService.java
    │   ├── BookingService.java
    │   └── ContactService.java
    ├── repository/                   (資料庫查詢 / DB Access)
    │   ├── PackageRepository.java
    │   ├── SessionRepository.java
    │   ├── BookingRepository.java
    │   └── ContactMessageRepository.java
    ├── model/                        (JPA 實體 / Database Entities)
    │   ├── Package.java
    │   ├── Session.java
    │   ├── Booking.java
    │   ├── ContactMessage.java
    │   └── enums/BookingStatus.java
    ├── dto/                          (請求/回應格式 / Request & Response Shapes)
    │   ├── BookingRequestDTO.java
    │   ├── BookingResponseDTO.java
    │   ├── ContactRequestDTO.java
    │   ├── PackageResponseDTO.java
    │   └── SessionResponseDTO.java
    └── exception/                    (錯誤處理 / Error Handling)
        ├── BusinessException.java
        └── GlobalExceptionHandler.java
```

**關鍵設計思路 / Key Design Decisions:**
- **前後端一體部署**: 前端 HTML 頁面由 Spring Boot 直接提供服務 (static folder)，無需分開部署前端伺服器。  
  Frontend HTML is served directly by Spring Boot from the `static/` folder — no separate frontend server needed.
- **REST API**: 前端透過 `fetch()` 呼叫後端 API，後端回傳 JSON。  
  Frontend calls backend via `fetch()` REST calls; backend responds with JSON.
- **分層架構**: Controller → Service → Repository → Database，每層職責分明。  
  Layered architecture: Controller → Service → Repository → Database with clear responsibilities per layer.

---

## 2. 技術棧 / Tech Stack

| 層 / Layer | 技術 / Technology | 說明 / Description |
|---|---|---|
| 前端 / Frontend | HTML5 + Vanilla JavaScript | 無框架，使用原生 JS / Pure JS, no framework |
| 前端樣式 / Styling | Tailwind CSS (CDN) | utility-first CSS framework |
| 前端圖標 / Icons | Font Awesome 6 (CDN) | Icon library |
| 後端 / Backend | Java 17 + Spring Boot 3.5 | REST API server |
| 持久化 / Persistence | Spring Data JPA (Hibernate) | ORM for MySQL |
| 資料庫 / Database | MySQL 8 | Relational database |
| 驗證 / Validation | Spring Boot Validation (jakarta) | Bean Validation on DTOs |
| 工具 / Utilities | Lombok | Auto-generates boilerplate (getters, setters, builders) |
| 構建 / Build | Maven (mvnw) | Java build tool |
| 部署 / Deployment | AWS EC2 | Cloud server at `54.254.174.73` |

---

## 3. 資料庫設計 / Database Design (`schma.sql`)

**📄 文件路徑 / File:** `schma.sql`  
**作用 / Purpose:** 建立資料庫表格、插入示範數據 / Creates all DB tables and inserts sample data.

### 資料表關係 / Table Relationships

```
packages (1) ──< sessions (many)   [一個套餐有多個時段]
packages (1) ──< bookings (many)   [一個套餐有多個預訂]
sessions  (1) ──< bookings (many)  [一個時段有多個預訂]
contact_messages                    [獨立表格，無外鍵]
```

### `packages` 表 — 自助餐套餐

```sql
-- 儲存所有自助餐套餐資訊
-- Stores all buffet package offerings
CREATE TABLE packages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,        -- 套餐名稱 e.g. "Signature Dinner Buffet"
    type VARCHAR(50) NOT NULL,         -- 類型 e.g. "Dinner", "Brunch", "Chinese"
    description TEXT NOT NULL,         -- 詳細描述
    price_per_person DECIMAL(10,2),    -- 每位價格 (HKD)
    image_url VARCHAR(500),            -- 套餐圖片網址
    created_at TIMESTAMP               -- 建立時間
);
```

**預載數據 / Pre-loaded Data (6 packages):**
| ID | Name | Type | Price/Person |
|----|------|------|-------------|
| 1 | Signature Dinner Buffet | Dinner | $388 |
| 2 | Weekend Brunch | Brunch | $298 |
| 3 | Premium Seafood Feast | Special | $488 |
| 4 | Luxury Afternoon Tea | Snack | $188 |
| 5 | Family Holiday Feast | Family | $328 |
| 6 | Dim Sum Brunch | Chinese | $268 |

### `sessions` 表 — 用餐時段

```sql
-- 每個套餐有多個可預訂時段
-- Each package has multiple bookable time slots
CREATE TABLE sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    package_id BIGINT NOT NULL,            -- 外鍵 → packages.id
    session_label VARCHAR(50),             -- 時段標籤 e.g. "Early Dinner (6:00 PM)"
    session_date DATE NOT NULL,            -- 日期 e.g. 2025-05-05
    start_time TIME NOT NULL,              -- 開始時間 e.g. 18:00:00
    end_time TIME NOT NULL,                -- 結束時間 e.g. 20:30:00
    total_seats INT DEFAULT 50,            -- 總座位數
    available_seats INT DEFAULT 50,        -- 剩餘座位數 (預訂後減少)
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
);
```

### `bookings` 表 — 預訂記錄

```sql
-- 儲存每筆預訂的完整資訊
-- Stores every booking transaction
CREATE TABLE bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_reference VARCHAR(20) UNIQUE,  -- 唯一參考碼 e.g. "BKG-260503-1234"
    package_id BIGINT NOT NULL,            -- 外鍵 → packages.id
    session_id BIGINT NOT NULL,            -- 外鍵 → sessions.id
    customer_name VARCHAR(100) NOT NULL,   -- 顧客姓名
    customer_email VARCHAR(100) NOT NULL,  -- 顧客電郵
    customer_phone VARCHAR(20) NOT NULL,   -- 顧客電話
    guest_count INT NOT NULL DEFAULT 1,    -- 人數 (1–20)
    special_requests TEXT,                 -- 特殊要求 (可選)
    total_price DECIMAL(10,2) NOT NULL,    -- 總金額 = price_per_person × guest_count
    status ENUM('CONFIRMED','CANCELLED'),  -- 預訂狀態
    created_at TIMESTAMP,
    updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES packages(id),
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);
```

### `contact_messages` 表 — 聯絡訊息

```sql
-- 儲存用戶從 About 頁面發送的訊息
-- Stores messages submitted via the Contact Us form
CREATE TABLE contact_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,  -- 是否已讀 (admin 功能)
    created_at TIMESTAMP
);
```

---

## 4. 後端 (Backend) — Spring Boot

### 4.1 進入點 / Entry Point — `BuffetEaseApplication.java`

**📄 文件路徑 / File:** `src/main/java/com/buffetease/buffet_ease/BuffetEaseApplication.java`

```java
// Spring Boot 應用的啟動類，包含 main 方法
// The Spring Boot application entry point containing the main() method

@SpringBootApplication  // 啟用自動配置、組件掃描 / Enables auto-config & component scan
public class BuffetEaseApplication {
    public static void main(String[] args) {
        SpringApplication.run(BuffetEaseApplication.class, args);
        // 啟動後在 console 印出提示訊息
        // Prints startup info to console
        System.out.println("BuffetEase Backend is running on http://localhost:8080");
    }
}
```

**作用 / What it does:**  
- `@SpringBootApplication` = 三個注解的合體：`@Configuration` + `@EnableAutoConfiguration` + `@ComponentScan`  
  This single annotation combines `@Configuration`, `@EnableAutoConfiguration`, and `@ComponentScan`.
- 告訴 Spring 掃描同一包下的所有 Bean（controllers, services, repositories）。  
  Tells Spring to scan all beans (controllers, services, repositories) under the same package.

---

### 4.2 配置 / Config — `CorsConfig.java`

**📄 文件路徑 / File:** `src/main/java/com/buffetease/buffet_ease/config/CorsConfig.java`

```java
// 跨來源資源共享 (CORS) 配置
// Cross-Origin Resource Sharing configuration — allows the browser to call the API

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")              // 只對 /api/... 路徑生效
                .allowedOrigins("http://54.254.174.73") // 允許的來源 (AWS EC2 IP)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);                      // 預檢快取 1 小時
    }
}
```

**作用 / What it does:**  
- 允許瀏覽器從 `http://54.254.174.73` 呼叫 `/api/**` 路徑的接口。  
  Permits the browser at the EC2 IP to call any `/api/**` endpoint.
- 如無此配置，瀏覽器的同源策略會阻止 Ajax 請求。  
  Without this, the browser's Same-Origin Policy would block all Ajax calls.
- 同時，各 Controller 也有 `@CrossOrigin(origins = "*")` 作雙重保障。  
  Controllers also carry `@CrossOrigin(origins = "*")` as an extra safety net.

**相關配置 / Related config:** `src/main/resources/application.properties`

```properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/buffetease_db
spring.datasource.username=${DB_USERNAME:admin}   # 從環境變數讀取，預設 admin
spring.datasource.password=${DB_PASSWORD:admin123}
spring.jpa.hibernate.ddl-auto=validate            # 只驗證結構，不自動建表
spring.jpa.show-sql=true                          # 顯示 SQL 語句（debug 用）
```

---

### 4.3 資料模型 / Models

> 每個 Model 對應資料庫的一張表，使用 JPA 注解映射。  
> Each Model maps to one DB table via JPA annotations.

---

#### `Package.java` — 套餐實體

**📄 文件路徑 / File:** `src/main/java/com/buffetease/buffet_ease/model/Package.java`

```java
// 映射到 packages 資料表
// Maps to the 'packages' database table

@Entity
@Table(name = "packages")
@Data                  // Lombok: 自動生成 getters/setters/toString/equals
@NoArgsConstructor     // Lombok: 無參構造函數
@AllArgsConstructor    // Lombok: 全參構造函數
public class Package {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // 主鍵自增
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;                  // 套餐名稱

    @Column(nullable = false, length = 50)
    private String type;                  // 類型 (Dinner / Brunch / etc.)

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;           // 詳細描述

    @Column(name = "price_per_person", nullable = false)
    private BigDecimal pricePerPerson;    // 每位價格

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;              // Unsplash 圖片網址

    @JsonIgnore                           // 防止序列化時循環引用
    @OneToMany(mappedBy = "packageObj", cascade = CascadeType.ALL)
    private List<Session> sessions = new ArrayList<>();  // 一對多：一個套餐 → 多個時段

    @PrePersist
    protected void onCreate() {           // 儲存前自動設置建立時間
        createdAt = LocalDateTime.now();
    }
}
```

**重要說明 / Key Points:**
- `@OneToMany` — 表示一個 Package 有多個 Session。`mappedBy = "packageObj"` 表示外鍵在 Session 那邊。  
  One Package → many Sessions. `mappedBy` means the foreign key lives in the `Session` table.
- `@JsonIgnore` — 避免 JSON 序列化時 Package→Session→Package 無限循環。  
  Prevents infinite recursion during JSON serialization (Package→Session→Package loop).
- `cascade = CascadeType.ALL` — 刪除套餐時，相關時段也一併刪除。  
  Deleting a package cascades to delete all its sessions.

---

#### `Session.java` — 時段實體

**📄 文件路徑 / File:** `src/main/java/com/buffetease/buffet_ease/model/Session.java`

```java
// 映射到 sessions 資料表
// Maps to the 'sessions' database table

@Entity
@Table(name = "sessions")
@Data @NoArgsConstructor @AllArgsConstructor
public class Session {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)        // 多個時段 → 一個套餐
    @JoinColumn(name = "package_id", nullable = false)
    private Package packageObj;               // 外鍵列: package_id

    @Column(name = "session_label", nullable = false, length = 50)
    private String sessionLabel;              // e.g. "Early Dinner (6:00 PM)"

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;            // 日期

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;              // 開始時間

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;                // 結束時間

    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats;               // 總座位數

    @Column(name = "available_seats", nullable = false)
    private Integer availableSeats;           // 剩餘座位數 (動態更新)
}
```

**重要說明 / Key Points:**
- `availableSeats` 是動態的！每次有人預訂或取消，這個數字都會改變。  
  `availableSeats` is dynamic — it decreases on booking and increases on cancellation.
- `FetchType.LAZY` — 查詢 Session 時不立即載入 Package，減少不必要的 SQL。  
  Lazy loading means Package data is NOT fetched unless explicitly accessed, reducing SQL queries.

---

#### `Booking.java` — 預訂實體

**📄 文件路徑 / File:** `src/main/java/com/buffetease/buffet_ease/model/Booking.java`

```java
// 映射到 bookings 資料表，儲存每筆預訂
// Maps to 'bookings' table — one row per reservation transaction

@Entity @Table(name = "bookings")
@Data @NoArgsConstructor @AllArgsConstructor
public class Booking {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_reference", unique = true, nullable = false, length = 20)
    private String bookingReference;          // e.g. "BKG-260503-1234"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", nullable = false)
    private Package packageObj;               // 預訂的套餐

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;                  // 預訂的時段

    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private Integer guestCount;
    private String specialRequests;           // 可為 null

    @Column(name = "total_price", nullable = false)
    private BigDecimal totalPrice;            // pricePerPerson × guestCount

    @Enumerated(EnumType.STRING)              // 資料庫中儲存 "CONFIRMED" 或 "CANCELLED"
    private BookingStatus status = BookingStatus.CONFIRMED;

    @PrePersist
    protected void onCreate() {               // 建立時自動設置時間戳
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {               // 更新時自動刷新時間戳
        updatedAt = LocalDateTime.now();
    }
}
```

---

#### `ContactMessage.java` — 聯絡訊息實體

**📄 文件路徑 / File:** `src/main/java/com/buffetease/buffet_ease/model/ContactMessage.java`

```java
// 儲存透過 About 頁面 Contact Us 表格發送的訊息
// Stores messages submitted via the Contact Us form on the About page

@Entity @Table(name = "contact_messages")
@Data @NoArgsConstructor @AllArgsConstructor
public class ContactMessage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_read")
    private Boolean isRead = false;           // 預設未讀，可供管理員標記已讀

    // @PrePersist 自動設置 createdAt
}
```

---

#### `BookingStatus.java` — 預訂狀態列舉

**📄 文件路徑 / File:** `src/main/java/com/buffetease/buffet_ease/model/enums/BookingStatus.java`

```java
// 預訂只有兩種狀態
// A booking can only be in one of two states
public enum BookingStatus {
    CONFIRMED,   // 已確認（預訂成功後預設狀態）
    CANCELLED    // 已取消（顧客主動取消後）
}
```

---

### 4.4 資料傳輸物件 / DTOs

> DTO (Data Transfer Object) = 控制前後端溝通的數據格式，避免直接暴露 Model 內部結構。  
> DTOs control the exact shape of data sent/received — they protect the internal model from being exposed.

---

#### `BookingRequestDTO.java` — 創建預訂的請求格式

**📄 文件路徑 / File:** `src/main/java/com/buffetease/buffet_ease/dto/BookingRequestDTO.java`

```java
// 前端發送 POST /api/bookings 時的請求 body 格式
// Shape of the JSON body sent by frontend when creating a booking

@Data
public class BookingRequestDTO {

    @NotNull(message = "Package ID is required")
    private Long packageId;                   // 套餐 ID

    @NotNull(message = "Session ID is required")
    private Long sessionId;                   // 時段 ID

    @NotBlank
    @Size(min = 2, max = 100)
    private String customerName;              // 顧客姓名 (2–100 字符)

    @NotBlank
    @Email(message = "Invalid email format")
    private String customerEmail;             // 必須是合法電郵格式

    @NotBlank
    @Pattern(regexp = "^[0-9+\\-() ]+$")     // 只允許數字、+、-、空格、括號
    private String customerPhone;

    @NotNull
    @Min(1) @Max(20)                          // 1–20 人
    private Integer guestCount;

    private String specialRequests;           // 可選，無驗證
}
```

**驗證說明 / Validation Notes:**  
當前端傳來的數據不符合以上規則，Spring 自動回傳 400 Bad Request，由 `GlobalExceptionHandler` 格式化錯誤訊息。  
If any field violates these rules, Spring auto-returns 400 Bad Request formatted by `GlobalExceptionHandler`.

---

#### `BookingResponseDTO.java` — 預訂回應格式

**📄 文件路徑 / File:** `src/main/java/com/buffetease/buffet_ease/dto/BookingResponseDTO.java`

```java
// 後端回傳給前端的預訂資訊格式（包含從多個 entity 組合的資訊）
// Response shape sent to frontend — combines data from Booking, Package, and Session

@Data @Builder   // @Builder 讓我們使用 builder pattern 建構物件
public class BookingResponseDTO {
    private Long id;
    private String bookingReference;      // e.g. "BKG-260503-1234"
    private String packageName;           // 從 Package entity 取得
    private String sessionLabel;          // 從 Session entity 取得
    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private Integer guestCount;
    private String specialRequests;
    private BigDecimal totalPrice;
    private BookingStatus status;         // CONFIRMED or CANCELLED
    private String createdAt;
}
```

---

#### `PackageResponseDTO.java` / `SessionResponseDTO.java` / `ContactRequestDTO.java`

**📄 文件路徑 / Files:**
- `src/main/java/com/buffetease/buffet_ease/dto/PackageResponseDTO.java`
- `src/main/java/com/buffetease/buffet_ease/dto/SessionResponseDTO.java`
- `src/main/java/com/buffetease/buffet_ease/dto/ContactRequestDTO.java`

```java
// PackageResponseDTO — 回傳給前端的套餐資訊
// Response shape for a single package
@Data @Builder
public class PackageResponseDTO {
    private Long id;
    private String name;
    private String type;
    private String description;
    private BigDecimal pricePerPerson;
    private String imageUrl;
    // 注意：不包含 sessions 列表，避免資料過大
    // Sessions list intentionally excluded to keep response lean
}

// SessionResponseDTO — 回傳給前端的時段資訊
// Response shape for a single session
@Data @Builder
public class SessionResponseDTO {
    private Long id;
    private String sessionLabel;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer availableSeats;
    private Integer totalSeats;
}

// ContactRequestDTO — 聯絡表格的請求格式（有驗證）
// Shape of the contact form submission with validation
@Data
public class ContactRequestDTO {
    @NotBlank private String name;
    @NotBlank @Email private String email;
    @NotBlank private String message;
}
```

---

### 4.5 資料庫存取 / Repositories

> Repository 層透過繼承 `JpaRepository` 自動獲得 CRUD 操作，無需寫 SQL（除非需要自定義查詢）。  
> Extending `JpaRepository` auto-provides CRUD for free. Custom queries are added only when needed.

---

#### `PackageRepository.java`

**📄 文件路徑 / File:** `src/main/java/com/buffetease/buffet_ease/repository/PackageRepository.java`

```java
// 繼承 JpaRepository 自動獲得 findAll(), findById(), save(), delete() 等方法
// Inheriting JpaRepository auto-provides findAll(), findById(), save(), delete(), existsById()...

@Repository
public interface PackageRepository extends JpaRepository<Package, Long> {
    // 無需額外方法，JpaRepository 已提供所有所需的操作
    // No custom methods needed — JpaRepository covers all required operations
}
```

---

#### `SessionRepository.java`

**📄 文件路徑 / File:** `src/main/java/com/buffetease/buffet_ease/repository/SessionRepository.java`

```java
@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {

    // 方法一：根據套餐ID找所有時段（包括過去的）
    // Method 1: Find all sessions for a package (including past ones)
    List<Session> findByPackageObjId(Long packageId);

    // 方法二：自定義 JPQL 查詢 — 只找今天之後的時段，並按日期/時間排序
    // Method 2: Custom JPQL — finds only upcoming sessions, sorted by date then time
    @Query("SELECT s FROM Session s WHERE s.packageObj.id = :packageId " +
           "AND s.sessionDate >= CURRENT_DATE " +
           "ORDER BY s.sessionDate ASC, s.startTime ASC")
    List<Session> findUpcomingSessionsByPackageId(@Param("packageId") Long packageId);
}
```

**為什麼需要自定義查詢? / Why a custom query?**  
前端不應顯示已過去的時段給用戶選擇，所以只返回今天或之後的時段。  
Users shouldn't see past sessions to book into, so we filter `sessionDate >= CURRENT_DATE`.

---

#### `BookingRepository.java`

**📄 文件路徑 / File:** `src/main/java/com/buffetease/buffet_ease/repository/BookingRepository.java`

```java
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // 根據電郵查找該用戶的所有預訂（用於「我的預訂」頁面）
    // Find all bookings by customer email (used in My Bookings page)
    List<Booking> findByCustomerEmail(String email);

    // 根據預訂參考碼查找（用於取消預訂）
    // Find by booking reference (used for cancellation)
    Optional<Booking> findByBookingReference(String bookingReference);

    // 根據電郵和狀態篩選（可用於只顯示已確認的預訂）
    // Filter by email + status (e.g., only show CONFIRMED bookings)
    List<Booking> findByCustomerEmailAndStatus(String email, BookingStatus status);
}
```

**Spring Data JPA 命名規則 / Spring Data JPA Naming Convention:**  
方法名稱如 `findByCustomerEmail` 會自動轉成 SQL: `SELECT * FROM bookings WHERE customer_email = ?`  
Method names like `findByCustomerEmail` are auto-translated to `SELECT * FROM bookings WHERE customer_email = ?`

---

#### `ContactMessageRepository.java`

**📄 文件路徑 / File:** `src/main/java/com/buffetease/buffet_ease/repository/ContactMessageRepository.java`

```java
// 簡單的聯絡訊息存取，只需要基本的 save() 功能
// Simple repository — only needs save() to persist contact form submissions

@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
    // 無需自定義方法 / No custom methods needed
}
```

---

### 4.6 業務邏輯 / Services

> Service 層包含真正的業務邏輯，如計算總價、驗證座位、生成預訂碼等。  
> The Service layer contains real business logic: price calculation, seat validation, reference generation, etc.

---

#### `PackageService.java`

**📄 文件路徑 / File:** `src/main/java/com/buffetease/buffet_ease/service/PackageService.java`

```java
@Service
@RequiredArgsConstructor   // Lombok: 自動生成包含 final 字段的構造函數（用於依賴注入）
public class PackageService {

    private final PackageRepository packageRepository;
    private final SessionRepository sessionRepository;

    // 函數一：取得所有套餐
    // Function 1: Fetch all packages and convert to DTO list
    public List<PackageResponseDTO> getAllPackages() {
        return packageRepository.findAll()    // 從 DB 取得所有 Package entity
                .stream()
                .map(this::convertToDTO)      // 每個 entity 轉成 DTO
                .collect(Collectors.toList());
    }

    // 函數二：根據 ID 取得單個套餐
    // Function 2: Get a specific package by ID (throws if not found)
    public PackageResponseDTO getPackageById(Long id) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Package not found with id: " + id));
        return convertToDTO(pkg);
    }

    // 函數三：取得套餐的未來時段
    // Function 3: Get upcoming (future-only) sessions for a package
    public List<SessionResponseDTO> getSessionsByPackageId(Long packageId) {
        if (!packageRepository.existsById(packageId)) {
            throw new BusinessException("Package not found with id: " + packageId);
        }
        return sessionRepository.findUpcomingSessionsByPackageId(packageId)
                .stream()
                .map(this::convertToSessionDTO)
                .collect(Collectors.toList());
    }

    // 私有轉換方法：Package entity → PackageResponseDTO
    // Private converter: Package entity → PackageResponseDTO
    private PackageResponseDTO convertToDTO(Package pkg) {
        return PackageResponseDTO.builder()
                .id(pkg.getId())
                .name(pkg.getName())
                .type(pkg.getType())
                .description(pkg.getDescription())
                .pricePerPerson(pkg.getPricePerPerson())
                .imageUrl(pkg.getImageUrl())
                .build();
    }

    // 私有轉換方法：Session entity → SessionResponseDTO
    private SessionResponseDTO convertToSessionDTO(Session session) {
        return SessionResponseDTO.builder()
                .id(session.getId())
                .sessionLabel(session.getSessionLabel())
                .date(session.getSessionDate())
                .startTime(session.getStartTime())
                .endTime(session.getEndTime())
                .availableSeats(session.getAvailableSeats())
                .totalSeats(session.getTotalSeats())
                .build();
    }
}
```

---

#### `BookingService.java` ⭐ (最重要的 Service / Most Important Service)

**📄 文件路徑 / File:** `src/main/java/com/buffetease/buffet_ease/service/BookingService.java`

##### 函數一：`createBooking()` — 創建預訂

```java
// @Transactional: 確保資料庫操作的原子性（全成功或全失敗）
// @Transactional: ensures the booking + seat update either BOTH succeed or BOTH roll back

@Transactional
public BookingResponseDTO createBooking(BookingRequestDTO request) {

    // 步驟 1: 驗證套餐存在 / Step 1: Validate package exists
    Package pkg = packageRepository.findById(request.getPackageId())
            .orElseThrow(() -> new BusinessException("Package not found"));

    // 步驟 2: 驗證時段存在 / Step 2: Validate session exists
    Session session = sessionRepository.findById(request.getSessionId())
            .orElseThrow(() -> new BusinessException("Session not found"));

    // 步驟 3: 驗證剩餘座位充足
    // Step 3: Validate enough seats are available
    if (session.getAvailableSeats() < request.getGuestCount()) {
        throw new BusinessException("Not enough seats. Only " + session.getAvailableSeats() + " left.");
    }

    // 步驟 4: 驗證時段未過期 / Step 4: Validate session is in the future
    if (session.getSessionDate().isBefore(LocalDate.now())) {
        throw new BusinessException("Cannot book past sessions");
    }

    // 步驟 5: 計算總金額 / Step 5: Calculate total price
    BigDecimal totalPrice = pkg.getPricePerPerson()
            .multiply(BigDecimal.valueOf(request.getGuestCount()));

    // 步驟 6: 生成唯一預訂碼 / Step 6: Generate unique booking reference
    String bookingReference = generateBookingReference();  // e.g. "BKG-260503-1234"

    // 步驟 7: 建立並儲存預訂 / Step 7: Create and save the Booking entity
    Booking booking = new Booking();
    booking.setBookingReference(bookingReference);
    booking.setPackageObj(pkg);
    booking.setSession(session);
    booking.setCustomerName(request.getCustomerName());
    booking.setCustomerEmail(request.getCustomerEmail());
    booking.setCustomerPhone(request.getCustomerPhone());
    booking.setGuestCount(request.getGuestCount());
    booking.setSpecialRequests(request.getSpecialRequests());
    booking.setTotalPrice(totalPrice);
    booking.setStatus(BookingStatus.CONFIRMED);

    // 步驟 8: 減少時段的剩餘座位
    // Step 8: Decrement available seats in the session
    session.setAvailableSeats(session.getAvailableSeats() - request.getGuestCount());
    sessionRepository.save(session);   // 更新座位數

    Booking savedBooking = bookingRepository.save(booking);
    return convertToResponseDTO(savedBooking);
}
```

##### 函數二：`getBookingsByEmail()` — 查詢預訂

```java
// 根據電郵地址查找所有預訂記錄
// Find all bookings associated with a given email address

public List<BookingResponseDTO> getBookingsByEmail(String email) {
    if (email == null || email.trim().isEmpty()) {
        throw new BusinessException("Email cannot be empty");
    }
    List<Booking> bookings = bookingRepository.findByCustomerEmail(email);
    // 把每個 Booking entity 轉成 DTO 後回傳
    return bookings.stream()
            .map(this::convertToResponseDTO)
            .collect(Collectors.toList());
}
```

##### 函數三：`cancelBooking()` — 取消預訂

```java
// 取消指定預訂參考碼的預訂，並返還座位
// Cancel a booking by reference and return seats to the session

@Transactional
public void cancelBooking(String bookingReference) {
    Booking booking = bookingRepository.findByBookingReference(bookingReference)
            .orElseThrow(() -> new BusinessException("Booking not found"));

    if (booking.getStatus() == BookingStatus.CANCELLED) {
        throw new BusinessException("Booking is already cancelled");
    }

    // 把人數返還給時段的剩餘座位
    // Return the guest count back to the session's available seats
    Session session = booking.getSession();
    session.setAvailableSeats(session.getAvailableSeats() + booking.getGuestCount());
    sessionRepository.save(session);

    // 更新狀態為已取消 / Update booking status to CANCELLED
    booking.setStatus(BookingStatus.CANCELLED);
    bookingRepository.save(booking);
}
```

##### 私有輔助函數 / Private Helper Functions

```java
// 生成預訂參考碼，格式：BKG-YYMMDD-XXXX（隨機4位數）
// Generates booking reference in format: BKG-YYMMDD-XXXX (random 4 digits)
private String generateBookingReference() {
    String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
    String randomPart = String.format("%04d", new Random().nextInt(10000));
    return "BKG-" + datePart + "-" + randomPart;
    // e.g. "BKG-260503-1234"
}

// 把 Booking entity 轉換為 BookingResponseDTO
// Converts a Booking entity to the response DTO (safely handles nulls)
private BookingResponseDTO convertToResponseDTO(Booking booking) {
    // 安全地從關聯 entity 中取得數據（防止 NullPointerException）
    // Safely extracts data from related entities (NPE protection)
    String packageName = booking.getPackageObj() != null ? booking.getPackageObj().getName() : "";
    // ... (其他字段的安全提取)
    return BookingResponseDTO.builder()
            .id(booking.getId())
            .bookingReference(booking.getBookingReference())
            .packageName(packageName)
            // ... 其他字段
            .build();
}
```

---

#### `ContactService.java`

**📄 文件路徑 / File:** `src/main/java/com/buffetease/buffet_ease/service/ContactService.java`

```java
@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactMessageRepository contactMessageRepository;

    // 唯一函數：儲存聯絡訊息
    // Single function: Save a contact message to the database
    public void saveContactMessage(ContactRequestDTO request) {
        ContactMessage message = new ContactMessage();
        message.setName(request.getName());
        message.setEmail(request.getEmail());
        message.setMessage(request.getMessage());
        message.setIsRead(false);                    // 預設未讀
        contactMessageRepository.save(message);      // 持久化到 DB
    }
}
```

---

### 4.7 API 控制器 / Controllers

> Controller 層接收 HTTP 請求，調用 Service，回傳 HTTP 回應。  
> Controllers receive HTTP requests, delegate to Services, and return HTTP responses.

---

#### `PackageController.java`

**📄 文件路徑 / File:** `src/main/java/com/buffetease/buffet_ease/controller/PackageController.java`

```java
@RestController                         // 回傳 JSON（結合了 @Controller + @ResponseBody）
@RequestMapping("/api/packages")        // 所有端點前綴為 /api/packages
@CrossOrigin(origins = "*")             // 允許所有來源跨域訪問
@RequiredArgsConstructor
public class PackageController {

    private final PackageService packageService;

    // GET /api/packages → 取得所有套餐列表
    // GET /api/packages → Fetch all packages
    @GetMapping
    public ResponseEntity<List<PackageResponseDTO>> getAllPackages() {
        return ResponseEntity.ok(packageService.getAllPackages());
    }

    // GET /api/packages/{id} → 取得指定套餐
    // GET /api/packages/{id} → Get a specific package by ID
    @GetMapping("/{id}")
    public ResponseEntity<PackageResponseDTO> getPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(packageService.getPackageById(id));
    }

    // GET /api/packages/{id}/sessions → 取得套餐的所有未來時段
    // GET /api/packages/{id}/sessions → Get upcoming sessions for a package
    @GetMapping("/{id}/sessions")
    public ResponseEntity<List<SessionResponseDTO>> getSessionsByPackageId(@PathVariable Long id) {
        return ResponseEntity.ok(packageService.getSessionsByPackageId(id));
    }
}
```

---

#### `BookingController.java`

**📄 文件路徑 / File:** `src/main/java/com/buffetease/buffet_ease/controller/BookingController.java`

```java
@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // POST /api/bookings → 創建新預訂
    // POST /api/bookings → Create a new booking
    // @Valid 觸發 DTO 上的驗證注解 / @Valid triggers the validation annotations on the DTO
    @PostMapping
    public ResponseEntity<Map<String, Object>> createBooking(@Valid @RequestBody BookingRequestDTO request) {
        BookingResponseDTO booking = bookingService.createBooking(request);

        // 回傳格式包含：預訂碼、完整預訂資料、成功訊息
        Map<String, Object> response = new HashMap<>();
        response.put("bookingReference", booking.getBookingReference());
        response.put("booking", booking);
        response.put("message", "Booking created successfully");
        return ResponseEntity.ok(response);
    }

    // GET /api/bookings/email/{email} → 根據電郵查詢預訂
    // GET /api/bookings/email/{email} → Fetch all bookings for a given email
    @GetMapping("/email/{email}")
    public ResponseEntity<List<BookingResponseDTO>> getBookingsByEmail(@PathVariable String email) {
        return ResponseEntity.ok(bookingService.getBookingsByEmail(email));
    }

    // PUT /api/bookings/{reference}/cancel → 取消預訂
    // PUT /api/bookings/{reference}/cancel → Cancel a booking by reference
    @PutMapping("/{reference}/cancel")
    public ResponseEntity<Map<String, String>> cancelBooking(@PathVariable String reference) {
        bookingService.cancelBooking(reference);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Booking cancelled successfully");
        return ResponseEntity.ok(response);
    }
}
```

---

#### `ContactController.java`

**📄 文件路徑 / File:** `src/main/java/com/buffetease/buffet_ease/controller/ContactController.java`

```java
@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    // POST /api/contact → 提交聯絡訊息
    // POST /api/contact → Submit a contact message
    @PostMapping
    public ResponseEntity<Map<String, String>> sendMessage(@Valid @RequestBody ContactRequestDTO request) {
        contactService.saveContactMessage(request);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Message sent successfully");
        return ResponseEntity.ok(response);
    }
}
```

---

### 4.8 例外處理 / Exception Handling

#### `BusinessException.java`

**📄 文件路徑 / File:** `src/main/java/com/buffetease/buffet_ease/exception/BusinessException.java`

```java
// 自定義業務例外，用於表示業務邏輯錯誤（如座位不足、預訂不存在等）
// Custom exception for business logic errors (insufficient seats, booking not found, etc.)

public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}
```

**使用方式 / Usage:**
```java
throw new BusinessException("Not enough available seats. Only 3 seats left.");
// → 被 GlobalExceptionHandler 捕獲，回傳 400 Bad Request + {"error": "..."}
// → Caught by GlobalExceptionHandler → returns 400 Bad Request + {"error": "..."}
```

---

#### `GlobalExceptionHandler.java`

**📄 文件路徑 / File:** `src/main/java/com/buffetease/buffet_ease/exception/GlobalExceptionHandler.java`

```java
// 全局例外處理器，自動攔截所有 Controller 拋出的例外
// Global handler — intercepts all exceptions thrown from any Controller

@RestControllerAdvice   // 應用於所有 @RestController 的 AOP 切面
public class GlobalExceptionHandler {

    // 處理業務例外（如座位不足、資源不存在）
    // Handles business logic errors
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Map<String, String>> handleBusinessException(BusinessException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        // → HTTP 400 + {"error": "Not enough seats..."}
    }

    // 處理 DTO 驗證失敗（@Valid 觸發）
    // Handles DTO validation failures (triggered by @Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        // 遍歷所有字段錯誤，如 {"customerEmail": "Invalid email format"}
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            errors.put(fieldName, error.getDefaultMessage());
        });
        errors.put("error", "Validation failed");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
        // → HTTP 400 + {"customerEmail": "Invalid email format", "error": "Validation failed"}
    }

    // 處理所有其他未預期例外
    // Handles all other unexpected exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "An unexpected error occurred: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        // → HTTP 500
    }
}
```

---

## 5. 前端 (Frontend) — HTML + JavaScript

> 前端由 4 個純 HTML 文件組成，使用 Tailwind CSS 樣式和 Vanilla JavaScript。  
> Frontend consists of 4 plain HTML files using Tailwind CSS for styling and Vanilla JS for logic.  
> 所有頁面使用 `fetch()` API 與後端通訊，返回 JSON。  
> All pages communicate with the backend via the browser `fetch()` API, receiving JSON.

---

### 5.1 首頁 / Homepage — `index.html`

**📄 文件路徑 / File:** `src/main/resources/static/index.html`

**功能 / What it does:**
- 靜態展示頁面，無 JavaScript API 調用。  
  Purely static display page — no JavaScript API calls.
- 包含：導航欄、全屏英雄圖、特色介紹、頁尾。  
  Contains: Navbar, full-screen hero, feature highlights, footer.

**關鍵 HTML 結構 / Key HTML Structure:**

```html
<!-- 導航欄（每頁共用結構）/ Navbar (shared structure across all pages) -->
<nav class="bg-white shadow-sm sticky top-0 z-50">
  <a href="index.html">BuffetEase Logo + Title</a>
  <!-- 四個導航連結 / Four navigation links -->
  <a href="index.html">Home</a>
  <a href="packages.html">Packages</a>
  <a href="about.html">About</a>
  <a href="my-bookings.html">My Bookings</a>
</nav>

<!-- 英雄區：全屏背景圖 + 標題 + CTA 按鈕 -->
<!-- Hero Section: full-screen background image + headline + CTA button -->
<section class="hero-bg h-screen flex items-center text-white">
  <h1>A Symphony of Flavors</h1>
  <a href="packages.html">Explore Our Packages →</a>
  <!-- hero-bg 在 <style> 中定義，使用 Unsplash 圖片作背景 -->
  <!-- hero-bg defined in <style>, uses Unsplash image as background -->
</section>

<!-- 特色介紹：3 列圖標 + 文字 / Features: 3-column icons + text -->
<section class="py-24 bg-white">
  <i class="fa-solid fa-star">Premium Selection</i>
  <i class="fa-solid fa-clock">Flexible Sessions</i>
  <i class="fa-solid fa-users">Perfect for Groups</i>
</section>
```

**樣式設計 / Styling Notes:**
- 品牌色：橄欖綠 `#4a7043`，通過 `.brand-olive` 和 `.bg-brand-olive` class 應用。  
  Brand color olive green `#4a7043` applied via `.brand-olive` and `.bg-brand-olive` classes.
- 字體：`Playfair Display`（serif 標題用）和 `Inter`（正文用）。  
  Fonts: `Playfair Display` for headings (`.serif` class), `Inter` for body text.

---

### 5.2 套餐頁 / Packages Page — `packages.html`

**📄 文件路徑 / File:** `src/main/resources/static/packages.html`

**功能 / What it does:**
- 從後端動態載入套餐 → 顯示卡片。  
  Dynamically loads packages from backend → displays as cards.
- 點擊「Book This Package」→ 打開預訂彈窗。  
  Clicking "Book This Package" opens a booking modal.
- 用戶選擇時段 → 填寫資料 → 提交預訂。  
  User selects a session → fills in details → submits booking.

**JavaScript 函數詳解 / JavaScript Function Breakdown:**

```javascript
const API_BASE = '';        // 空字符串 = 使用相對路徑（同源），生產環境無需改動
                             // Empty string = relative path (same origin), no change needed for production
let currentPackage = null;  // 記住當前選中的套餐
let selectedSession = null; // 記住當前選中的時段
```

---

##### `showMessage(type, title, message)` — 通用彈出訊息

```javascript
// 顯示成功/錯誤/資訊的彈出框（替代瀏覽器原生 alert()）
// Shows a styled success/error/info modal (replaces native browser alert())
// type: 'success' | 'error' | 'info'

function showMessage(type, title, message) {
    const styles = {
        success: { icon: 'bg-green-600', symbol: 'fa-check' },
        error:   { icon: 'bg-red-600',   symbol: 'fa-triangle-exclamation' },
        info:    { icon: 'bg-blue-600',  symbol: 'fa-circle-info' }
    };
    // 根據 type 設置圖標顏色和符號
    // Sets icon color and symbol based on type
    // 顯示 #message-box div（透過移除 'hidden' class）
    // Shows #message-box div (by removing 'hidden' class)
    box.classList.remove('hidden');
}
```

---

##### `renderPackages()` — 渲染套餐卡片

```javascript
// 從 API 取得套餐列表並動態渲染 HTML 卡片
// Fetches package list from API and dynamically renders HTML cards

async function renderPackages() {
    const container = document.getElementById('packages-grid');

    try {
        // 1. 調用後端 API / Call backend API
        const response = await fetch(`${API_BASE}/api/packages`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const packages = await response.json();

        // 2. 動態生成 HTML 卡片 / Dynamically generate HTML cards
        container.innerHTML = packages.map(pkg => `
            <div class="bg-white rounded-3xl overflow-hidden shadow-lg ...">
                <img src="${pkg.imageUrl}" alt="${pkg.name}">     <!-- 從 API 取得的圖片 URL -->
                <h3>${pkg.name}</h3>                               <!-- 套餐名稱 -->
                <p>${pkg.description.substring(0,100)}...</p>      <!-- 截取前100字 -->
                <span>$${pkg.pricePerPerson} / person</span>       <!-- 價格 -->
                <button onclick="openBookingModal(${pkg.id})">     <!-- 點擊觸發預訂 -->
                    Book This Package
                </button>
            </div>
        `).join('');

    } catch (error) {
        // 3. 錯誤處理：顯示錯誤訊息和重試按鈕
        container.innerHTML = `<p>Failed to load packages. <button onclick="renderPackages()">Retry</button></p>`;
    }
}

window.onload = () => { renderPackages(); };  // 頁面載入後自動執行
```

---

##### `openBookingModal(packageId)` — 打開預訂彈窗

```javascript
// 點擊「Book This Package」後：取得套餐詳情 + 可用時段，並顯示彈窗
// After clicking "Book This Package": fetch package details + available sessions, show modal

async function openBookingModal(packageId) {
    try {
        // 1. 取得套餐詳情 / Fetch package details
        const pkgResponse = await fetch(`${API_BASE}/api/packages/${packageId}`);
        currentPackage = await pkgResponse.json();

        // 2. 取得未來時段列表 / Fetch upcoming sessions
        const sessionsResponse = await fetch(`${API_BASE}/api/packages/${packageId}/sessions`);
        const sessions = await sessionsResponse.json();

        // 3. 更新彈窗標題和顯示彈窗 / Update modal title and show it
        document.getElementById('modal-package-name').textContent = currentPackage.name;
        document.getElementById('booking-modal').classList.remove('hidden');
        document.getElementById('booking-form').classList.add('hidden');  // 先隱藏表格
        document.body.style.overflow = 'hidden';  // 禁止背景滾動

        // 4. 渲染時段按鈕 / Render session buttons
        renderSessions(sessions);
    } catch (error) {
        showMessage('error', 'Could not open booking', 'Failed to load session details.');
    }
}
```

---

##### `renderSessions(sessions)` — 渲染時段選擇按鈕

```javascript
// 動態渲染時段選擇按鈕，顯示日期、時段標籤、剩餘座位
// Renders session selection buttons with date, label, and available seats

function renderSessions(sessions) {
    const container = document.getElementById('session-list');
    container.innerHTML = sessions.map(session => `
        <button onclick="selectSession(this, ${session.id})"
                data-session-id="${session.id}"
                data-session-date="${session.date}"
                data-session-label="${session.sessionLabel}"
                class="session-btn p-6 border-2 border-transparent ...">
            <div>${new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', ... })}</div>
            <div>${session.sessionLabel}</div>    <!-- e.g. "Early Dinner (6:00 PM)" -->
            <div>${session.availableSeats} seats left</div>
        </button>
    `).join('');
}
```

---

##### `selectSession(btn, sessionId)` — 選擇時段

```javascript
// 用戶點擊時段按鈕後：高亮選中按鈕、記錄選中時段、顯示填寫表格
// After user clicks a session button: highlight it, store selected session, show booking form

function selectSession(btn, sessionId) {
    // 清除其他按鈕的選中樣式 / Clear selection style from all buttons
    document.querySelectorAll('.session-btn').forEach(b =>
        b.classList.remove('border-brand-olive', 'bg-green-50')
    );
    // 添加選中樣式到當前按鈕 / Add selection style to clicked button
    btn.classList.add('border-brand-olive', 'bg-green-50');

    // 保存選中的時段資訊 / Store selected session info
    selectedSession = {
        id: sessionId,
        date: btn.dataset.sessionDate,
        label: btn.dataset.sessionLabel
    };

    // 顯示填寫表格 / Show the booking form
    document.getElementById('booking-form').classList.remove('hidden');
    updateTotal();  // 立即計算並顯示總金額
}
```

---

##### `updateTotal()` — 即時計算總金額

```javascript
// 當人數改變時即時更新總金額顯示
// Dynamically updates total price display when guest count changes

function updateTotal() {
    if (!currentPackage) return;
    const guests = parseInt(document.getElementById('guest-count').value) || 1;
    const total = currentPackage.pricePerPerson * guests;
    document.getElementById('total-price').textContent = `$${total}`;
    // 顯示在彈窗底部 / Shown at the bottom of the modal
}
```

---

##### `confirmBooking()` — 提交預訂

```javascript
// 驗證表格並向後端提交預訂請求
// Validates the form and submits booking request to backend

async function confirmBooking() {
    // 1. 基本驗證 / Basic validation
    if (!selectedSession) {
        showMessage('error', 'Missing session', 'Please select a session.');
        return;
    }
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    if (!name || !email || !phone) {
        showMessage('error', 'Missing guest information', 'Please fill in all fields.');
        return;
    }

    // 2. 構建請求 body / Build request body (matches BookingRequestDTO)
    const bookingData = {
        packageId: currentPackage.id,
        sessionId: selectedSession.id,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        guestCount: parseInt(document.getElementById('guest-count').value),
        specialRequests: document.getElementById('special-request').value
    };

    // 3. 發送 POST 請求 / Send POST request to backend
    const response = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
    });

    const result = await response.json();

    if (response.ok) {
        // 4a. 成功：顯示預訂碼，保存電郵到 localStorage，關閉彈窗
        showMessage('success', 'Reservation successful',
            `Booking reference: ${result.bookingReference}\nTotal: $${result.booking.totalPrice}`);
        localStorage.setItem('buffetEaseEmail', email);  // 供 my-bookings.html 自動填入
        closeModal();
    } else {
        // 4b. 失敗：顯示後端回傳的錯誤訊息
        showMessage('error', 'Unable to create booking', result.error || 'Failed to create booking');
    }
}
```

---

### 5.3 我的預訂 / My Bookings — `my-bookings.html`

**📄 文件路徑 / File:** `src/main/resources/static/my-bookings.html`

**功能 / What it does:**
- 用戶輸入電郵 → 查詢所有相關預訂 → 顯示列表。  
  User inputs email → queries all associated bookings → displays list.
- 對已確認的預訂，可點擊「Cancel Booking」→ 確認彈窗 → 取消預訂。  
  For confirmed bookings, user can click "Cancel Booking" → confirmation modal → cancel.
- 頁面載入時自動從 `localStorage` 讀取上次使用的電郵並自動搜尋。  
  On load, auto-reads last-used email from `localStorage` and auto-searches.

**JavaScript 函數詳解 / JavaScript Function Breakdown:**

---

##### `searchBookings()` — 搜尋預訂

```javascript
// 根據電郵地址向後端查詢預訂，並渲染結果
// Queries backend for bookings by email and renders the results

async function searchBookings() {
    const email = document.getElementById('search-email').value.trim();
    if (!email) {
        showMessage('error', 'Missing email', 'Please enter your email address.');
        return;
    }

    // 保存電郵供下次使用 / Save email for next visit
    localStorage.setItem('buffetEaseEmail', email);

    // 顯示載入中動畫 / Show loading spinner
    container.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;

    // 呼叫 API：GET /api/bookings/email/{email}
    const response = await fetch(`${API_BASE}/api/bookings/email/${encodeURIComponent(email)}`);
    const bookings = await response.json();
    renderBookings(bookings);  // 渲染結果
}
```

---

##### `renderBookings(bookings)` — 渲染預訂列表

```javascript
// 把預訂列表動態渲染為 HTML 卡片
// Dynamically renders booking list as HTML cards

function renderBookings(bookings) {
    if (!bookings || bookings.length === 0) {
        // 空狀態：顯示「No reservations found」訊息
        container.innerHTML = `<p>No reservations found for this email.</p>`;
        return;
    }

    container.innerHTML = bookings.map(b => `
        <div class="bg-white rounded-3xl p-8 shadow-lg">
            <h3>${b.packageName}</h3>           <!-- 套餐名稱 -->
            <p>${new Date(b.sessionDate).toLocaleDateString(...)}</p>
            <p>${b.sessionLabel}</p>             <!-- 時段 e.g. "Early Dinner (6:00 PM)" -->
            <p>${b.guestCount} Guests</p>

            <!-- 狀態標籤：CONFIRMED = 綠色，CANCELLED = 紅色 -->
            <!-- Status badge: green for CONFIRMED, red for CANCELLED -->
            <span class="${b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                ${b.status}
            </span>

            <div>$${b.totalPrice}</div>

            <!-- 只有 CONFIRMED 狀態才顯示取消按鈕 -->
            <!-- Cancel button only shown for CONFIRMED bookings -->
            ${b.status === 'CONFIRMED' ? `
                <button onclick="openCancelModal('${b.bookingReference}')">Cancel Booking</button>
            ` : ''}
        </div>
    `).join('');
}
```

---

##### `openCancelModal(bookingReference)` / `closeCancelModal()` — 取消確認彈窗

```javascript
// 打開確認取消的彈窗，儲存預訂參考碼
// Opens the cancellation confirmation modal, stores the booking reference

function openCancelModal(bookingReference) {
    currentCancelReference = bookingReference;             // 記住要取消哪個
    document.getElementById('cancel-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';               // 禁止背景滾動
}

function closeCancelModal() {
    document.getElementById('cancel-modal').classList.add('hidden');
    currentCancelReference = null;
    document.body.style.overflow = 'auto';
}
```

---

##### `confirmCancel()` — 確認取消預訂

```javascript
// 向後端發送取消請求，成功後刷新預訂列表
// Sends cancellation request to backend, refreshes list on success

async function confirmCancel() {
    if (!currentCancelReference) return;

    // 發送 PUT 請求 / Send PUT request
    // PUT /api/bookings/{reference}/cancel
    const response = await fetch(
        `${API_BASE}/api/bookings/${currentCancelReference}/cancel`,
        { method: 'PUT' }
    );

    if (response.ok) {
        showMessage('success', 'Booking cancelled', 'Booking cancelled successfully.');
        closeCancelModal();
        await searchBookings();  // 刷新列表以反映新狀態 / Refresh list to show CANCELLED status
    } else {
        showMessage('error', 'Unable to cancel booking', result.error);
    }
}
```

**頁面載入邏輯 / Page Load Logic:**

```javascript
// 自動填入上次使用的電郵並搜尋 / Auto-fill last used email and search
window.onload = () => {
    const savedEmail = localStorage.getItem('buffetEaseEmail');
    if (savedEmail) {
        document.getElementById('search-email').value = savedEmail;
        searchBookings();  // 自動搜尋 / Auto-search
    }
};

// 支援按 Enter 搜尋 / Support Enter key to search
document.getElementById('search-email').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') { searchBookings(); }
});
```

---

### 5.4 關於我們 / About Page — `about.html`

**📄 文件路徑 / File:** `src/main/resources/static/about.html`

**功能 / What it does:**
- 三個 Tab 頁面：「Our Story」、「Our Team」、「Contact Us」。  
  Three tabbed sections: "Our Story", "Our Team", "Contact Us".
- Contact Us 表格可提交訊息到後端 API。  
  Contact Us form submits messages to the backend API.

**JavaScript 函數詳解 / JavaScript Function Breakdown:**

---

##### `switchTab(tabIndex)` — 切換 Tab

```javascript
// 切換三個 Tab 的顯示狀態，並更新 active 按鈕樣式
// Switches which tab content is visible and updates active button styling

function switchTab(tabIndex) {
    // 隱藏所有 Tab 內容 / Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });

    // 顯示選中的 Tab / Show selected tab
    document.getElementById(`content${tabIndex}`).classList.remove('hidden');

    // 更新按鈕樣式：選中的按鈕變綠色背景
    // Update button styles: active button gets green background
    document.querySelectorAll('.tab-button').forEach((btn, index) => {
        btn.classList.toggle('active', index === tabIndex);
        // .active class 在 <style> 中定義：background-color: #4a7043; color: white;
    });
}

// 頁面載入時預設顯示第 0 個 Tab（Our Story）
window.onload = () => { switchTab(0); };
```

---

##### `sendMessage()` — 提交聯絡訊息

```javascript
// 驗證聯絡表格並提交到後端 /api/contact
// Validates the contact form and submits to backend /api/contact

async function sendMessage() {
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    // 前端基本驗證：所有字段必填 / Frontend basic validation: all fields required
    if (!name || !email || !message) {
        showMessage('error', 'Message not sent', 'Please fill in all fields.');
        return;
    }

    // 發送 POST /api/contact / Send POST to /api/contact
    const response = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })  // 對應 ContactRequestDTO
    });

    if (response.ok) {
        showMessage('success', `Thank you, ${name}!`, "Your message has been received.");
        // 清空表格 / Clear the form
        document.getElementById('contact-name').value = '';
        document.getElementById('contact-email').value = '';
        document.getElementById('contact-message').value = '';
    }
}
```

**三個 Tab 的 HTML 結構 / HTML Structure of Three Tabs:**

```html
<!-- Tab 切換按鈕 / Tab switching buttons -->
<div class="inline-flex">
    <button onclick="switchTab(0)" id="tab0" class="tab-button active">Our Story</button>
    <button onclick="switchTab(1)" id="tab1" class="tab-button">Our Team</button>
    <button onclick="switchTab(2)" id="tab2" class="tab-button">Contact Us</button>
</div>

<!-- Tab 0: 餐廳故事 / Restaurant story -->
<div id="content0" class="tab-content">...</div>

<!-- Tab 1: 廚師團隊 / Chef team (3 chef cards with photos) -->
<div id="content1" class="tab-content hidden">...</div>

<!-- Tab 2: 聯絡表格 + 聯絡資訊 / Contact form + contact info -->
<div id="content2" class="tab-content hidden">...</div>
```

---

## 6. API 端點總覽 / API Endpoints Summary

| 方法/Method | 路徑/Path | 說明/Description | 請求體/Request Body | 回應/Response |
|---|---|---|---|---|
| `GET` | `/api/packages` | 取得所有套餐 | None | `[PackageResponseDTO]` |
| `GET` | `/api/packages/{id}` | 取得單個套餐 | None | `PackageResponseDTO` |
| `GET` | `/api/packages/{id}/sessions` | 取得未來時段 | None | `[SessionResponseDTO]` |
| `POST` | `/api/bookings` | 創建預訂 | `BookingRequestDTO` | `{bookingReference, booking, message}` |
| `GET` | `/api/bookings/email/{email}` | 查詢預訂 | None | `[BookingResponseDTO]` |
| `PUT` | `/api/bookings/{ref}/cancel` | 取消預訂 | None | `{message}` |
| `POST` | `/api/contact` | 提交聯絡訊息 | `ContactRequestDTO` | `{message}` |

---

## 7. 完整數據流程圖 / Full Data Flow

### 預訂流程 / Booking Flow

```
用戶 / User
  │
  │  1. 打開 packages.html
  │  ─────────────────────────────────────────────────────────────────
  │
  ├─► JS: renderPackages()
  │     └─► fetch GET /api/packages
  │               └─► PackageController.getAllPackages()
  │                     └─► PackageService.getAllPackages()
  │                           └─► PackageRepository.findAll()
  │                                 └─► SELECT * FROM packages
  │                                 ◄─── [Package entities]
  │                           ◄─── [PackageResponseDTOs]
  │               ◄─── JSON: [{id, name, type, price, imageUrl}, ...]
  │     ◄─── Display package cards with "Book" buttons
  │
  │  2. 點擊「Book This Package」/ Click "Book This Package"
  │  ─────────────────────────────────────────────────────────────────
  │
  ├─► JS: openBookingModal(packageId)
  │     ├─► fetch GET /api/packages/{id}           ← 取得套餐詳情
  │     └─► fetch GET /api/packages/{id}/sessions  ← 取得未來時段
  │               └─► SessionRepository.findUpcomingSessionsByPackageId()
  │                     └─► SELECT s FROM Session WHERE date >= CURRENT_DATE
  │     ◄─── Display session buttons in modal
  │
  │  3. 選擇時段 → 填寫資料 → 點擊「Confirm Reservation」
  │  ─────────────────────────────────────────────────────────────────
  │
  ├─► JS: confirmBooking()
  │     └─► fetch POST /api/bookings (body: BookingRequestDTO)
  │               └─► BookingController.createBooking()
  │                     └─► @Valid validates DTO
  │                     └─► BookingService.createBooking()
  │                           ├─► Check package exists
  │                           ├─► Check session exists
  │                           ├─► Check availableSeats >= guestCount
  │                           ├─► Check sessionDate >= today
  │                           ├─► Calculate totalPrice
  │                           ├─► Generate bookingReference "BKG-YYMMDD-XXXX"
  │                           ├─► Save Booking (INSERT INTO bookings)
  │                           └─► Update session.availableSeats -= guestCount
  │               ◄─── JSON: {bookingReference, booking, message}
  │     ◄─── Show success modal with booking reference
  │     ◄─── Save email to localStorage
```

### 取消預訂流程 / Cancellation Flow

```
用戶 / User
  │
  ├─► 打開 my-bookings.html → JS: window.onload reads localStorage email
  ├─► JS: searchBookings()
  │     └─► fetch GET /api/bookings/email/{email}
  │               └─► BookingController.getBookingsByEmail()
  │                     └─► BookingService.getBookingsByEmail()
  │                           └─► BookingRepository.findByCustomerEmail(email)
  │               ◄─── JSON: [BookingResponseDTO, ...]
  │     ◄─── Display booking cards (CONFIRMED in green, CANCELLED in red)
  │
  ├─► 點擊「Cancel Booking」/ Click "Cancel Booking"
  │     └─► JS: openCancelModal(bookingReference)  ← Shows confirmation modal
  │
  ├─► 點擊「Yes, Cancel」/ Click "Yes, Cancel"
  │     └─► JS: confirmCancel()
  │           └─► fetch PUT /api/bookings/{ref}/cancel
  │                     └─► BookingController.cancelBooking()
  │                           └─► BookingService.cancelBooking()
  │                                 ├─► Find booking by reference
  │                                 ├─► Check not already CANCELLED
  │                                 ├─► session.availableSeats += guestCount  ← Return seats
  │                                 └─► booking.status = CANCELLED
  │           ◄─── JSON: {message: "Booking cancelled successfully"}
  │     ◄─── Show success message
  │     ◄─── Auto-refresh bookings list (status now shows CANCELLED)
```

---

## 附錄：常見面試問題解答 / Appendix: Demo FAQ

**Q: 為什麼不用 React/Vue？/ Why not React/Vue?**  
A: 這個項目規模適合純 HTML + JS，無需框架的複雜性。Spring Boot 可以直接提供靜態文件。  
The project scale suits plain HTML + JS. No framework complexity needed. Spring Boot serves static files directly.

**Q: @Transactional 的作用 / What does @Transactional do?**  
A: 確保 `createBooking()` 中「儲存預訂」和「減少座位」這兩個資料庫操作同時成功或同時失敗（rollback），保持數據一致性。  
Ensures "save booking" + "decrement seats" either BOTH succeed or BOTH roll back, maintaining data consistency.

**Q: 如何防止重複預訂佔用過多座位 / How to prevent overselling?**  
A: Service 層先檢查 `availableSeats >= guestCount`，然後在同一個 `@Transactional` 方法中更新座位數。  
Service checks `availableSeats >= guestCount` before decrementing — all within one `@Transactional` method.

**Q: DTO 和 Model 的區別 / Difference between DTO and Model?**  
A: Model 是資料庫實體（JPA Entity），包含所有數據庫字段和關係。DTO 是我們選擇暴露給前端的字段子集，例如 `PackageResponseDTO` 不包含 sessions 列表。  
Model = JPA Entity with all DB fields and relationships. DTO = only the subset of fields exposed to the client (e.g., `PackageResponseDTO` excludes the sessions list).

**Q: LocalStorage 的用途 / What is localStorage used for?**  
A: 存儲用戶上次的電郵地址，讓 `my-bookings.html` 下次載入時自動搜尋，提升用戶體驗。  
Stores the user's last email so `my-bookings.html` can auto-search on next visit — improves UX.

**Q: CORS 配置的作用 / What does CORS config do?**  
A: 允許部署在 AWS EC2 的前端（`http://54.254.174.73`）向同一伺服器的 `/api/**` 路徑發出跨域請求，因為瀏覽器預設阻止跨源 Ajax。  
Allows the frontend hosted on EC2 to call `/api/**` — browsers block cross-origin Ajax requests by default.

---

*最後更新 / Last Updated: 2026-05-04 | BuffetEase COMP4442 Project*
