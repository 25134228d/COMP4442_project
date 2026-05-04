-- ═══════════════════════════════════════════════════════════════════════════════
-- schma.sql — Database initialisation script for BuffetEase
--
-- Run this script ONCE to set up the MySQL database from scratch.
-- It creates all tables and inserts sample/demo data.
-- Command to run: mysql -u root -p < schma.sql
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Create and select the database ─────────────────────────────────────────────
-- IF NOT EXISTS prevents an error if the database already exists.
CREATE DATABASE IF NOT EXISTS buffetease_db;
-- Tell MySQL to use this database for all subsequent statements.
USE buffetease_db;

-- ─── Drop existing tables (clean-slate setup) ────────────────────────────────────
-- DROP TABLE removes existing tables so we can recreate them fresh.
-- ORDER MATTERS: drop child tables (that have foreign keys) before parent tables.
-- bookings references sessions and packages → drop it first.
DROP TABLE IF EXISTS bookings;
-- sessions references packages → drop it before packages.
DROP TABLE IF EXISTS sessions;
-- packages has no foreign key dependencies → can be dropped after its children.
DROP TABLE IF EXISTS packages;
-- contact_messages is standalone (no foreign keys) → can be dropped at any time.
DROP TABLE IF EXISTS contact_messages;

-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE 1: packages
-- Stores the buffet dining packages offered by the restaurant.
-- Maps to the Package.java entity class.
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE packages (
    id               BIGINT PRIMARY KEY AUTO_INCREMENT, -- Auto-generated unique ID (1, 2, 3, ...).
    name             VARCHAR(100) NOT NULL,             -- Package display name, e.g. "Signature Dinner Buffet".
    type             VARCHAR(50)  NOT NULL,             -- Category label, e.g. "Dinner", "Brunch", "Chinese".
    description      TEXT         NOT NULL,             -- Long description text shown on the package card.
    price_per_person DECIMAL(10, 2) NOT NULL,           -- Cost per guest; DECIMAL ensures exact HKD values.
    image_url        VARCHAR(500) NOT NULL,             -- URL of the package photo.
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Automatically set to now when row is inserted.
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE 2: sessions
-- Stores time slots for each package on specific dates.
-- Maps to the Session.java entity class.
-- One package can have many sessions (one-to-many relationship).
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE sessions (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,  -- Auto-generated unique ID.
    package_id      BIGINT NOT NULL,                    -- Foreign key linking to packages.id.
    session_label   VARCHAR(50) NOT NULL,               -- Human-readable label, e.g. "Early Dinner (6:00 PM)".
    session_date    DATE NOT NULL,                      -- Calendar date of the session (no time part).
    start_time      TIME NOT NULL,                      -- When the session begins, e.g. 18:00:00.
    end_time        TIME NOT NULL,                      -- When the session ends, e.g. 20:30:00.
    total_seats     INT NOT NULL DEFAULT 50,            -- Maximum capacity (stays fixed).
    available_seats INT NOT NULL DEFAULT 50,            -- Remaining open seats (decreases when booked).
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- FOREIGN KEY enforces referential integrity:
    --   A session cannot reference a package_id that doesn't exist in the packages table.
    -- ON DELETE CASCADE: if a package is deleted, all its sessions are automatically deleted too.
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE 3: bookings
-- Stores customer reservations.
-- Maps to the Booking.java entity class.
-- Each booking links to one package and one session.
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE bookings (
    id                BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_reference VARCHAR(20) UNIQUE NOT NULL,      -- Human-readable ref, e.g. "BKG-260504-1234". UNIQUE prevents duplicates.
    package_id        BIGINT NOT NULL,                  -- Foreign key to packages.id (which package was booked).
    session_id        BIGINT NOT NULL,                  -- Foreign key to sessions.id (which time slot was booked).
    customer_name     VARCHAR(100) NOT NULL,
    customer_email    VARCHAR(100) NOT NULL,             -- Used to look up bookings on the "My Bookings" page.
    customer_phone    VARCHAR(20)  NOT NULL,
    guest_count       INT NOT NULL DEFAULT 1,            -- Number of guests; used to deduct from available_seats.
    special_requests  TEXT,                             -- Optional dietary / special notes (can be NULL).
    total_price       DECIMAL(10, 2) NOT NULL,           -- price_per_person × guest_count.
    -- ENUM restricts the status column to only "CONFIRMED" or "CANCELLED" — no invalid values.
    status            ENUM('CONFIRMED', 'CANCELLED') DEFAULT 'CONFIRMED',
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- ON UPDATE CURRENT_TIMESTAMP — MySQL automatically updates this column whenever the row changes
    -- (e.g. when a booking is cancelled). Maps to the @PreUpdate callback in Booking.java.
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- Foreign key constraints ensure data consistency:
    FOREIGN KEY (package_id) REFERENCES packages(id),
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- TABLE 4: contact_messages
-- Stores messages submitted via the "Contact Us" form on the About page.
-- Maps to the ContactMessage.java entity class.
-- Standalone table — no foreign key relationships.
-- ═══════════════════════════════════════════════════════════════════════════════
CREATE TABLE contact_messages (
    id         BIGINT PRIMARY KEY AUTO_INCREMENT,
    name       VARCHAR(100) NOT NULL,            -- Sender's full name.
    email      VARCHAR(100) NOT NULL,            -- Sender's email (for the restaurant to reply).
    message    TEXT NOT NULL,                   -- The message body text.
    is_read    BOOLEAN DEFAULT FALSE,            -- FALSE = unread; TRUE = staff has seen it.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SAMPLE DATA: packages
-- 6 sample buffet packages for demo purposes.
-- The Java API will return these rows on the packages page.
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO packages (name, type, description, price_per_person, image_url) VALUES
('Signature Dinner Buffet', 'Dinner', 'An exquisite evening spread featuring live seafood station, premium carving station with roasted prime rib, and an indulgent dessert bar.', 388.00, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1000'),
('Weekend Brunch', 'Brunch', 'Perfect for lazy weekends! Includes free-flow sparkling wine, eggs benedict station, fresh seafood on ice, and a chocolate fountain.', 298.00, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=1000'),
('Premium Seafood Feast', 'Special', 'Crab, lobster, fresh oysters, and sushi counter. A seafood lover''s dream come true with unlimited premium catches.', 488.00, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&q=80&w=1000'),
('Luxury Afternoon Tea', 'Snack', 'An assortment of delicate pastries, finger sandwiches, and premium tea selection.', 188.00, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80'),
('Family Holiday Feast', 'Family', 'Perfect for families with kids. Includes carving station, pasta bar, desserts, and a kids'' corner.', 328.00, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1000'),
('Dim Sum Brunch', 'Chinese', 'Authentic Hong Kong dim sum experience with unlimited bamboo steamers, congee station, and Chinese tea pairing.', 268.00, 'https://images.unsplash.com/photo-1769773662105-bf0b664921d6?auto=format&fit=crop&w=1200&q=80');

-- ═══════════════════════════════════════════════════════════════════════════════
-- SAMPLE DATA: sessions
-- Future sessions linked to the packages above.
-- DATE_ADD(CURDATE(), INTERVAL N DAY) dynamically creates dates relative to today,
-- ensuring the sessions always appear in the upcoming-sessions list regardless of when you run the script.
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO sessions (package_id, session_label, session_date, start_time, end_time, total_seats, available_seats) VALUES
(1, 'Early Dinner (6:00 PM)',    DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:00:00', '20:30:00', 50, 45), -- 5 seats already "taken" in demo.
(1, 'Late Dinner (8:30 PM)',     DATE_ADD(CURDATE(), INTERVAL 1 DAY), '20:30:00', '23:00:00', 50, 50), -- All 50 seats available.
(2, 'Brunch (11:30 AM)',         DATE_ADD(CURDATE(), INTERVAL 6 DAY), '11:30:00', '14:30:00', 60, 60),
(3, 'Dinner (6:30 PM)',          DATE_ADD(CURDATE(), INTERVAL 2 DAY), '18:30:00', '21:30:00', 40, 40),
(4, 'Afternoon Tea (2:00 PM)',   DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00:00', '16:30:00', 30, 25), -- 5 seats already "taken".
(5, 'Lunch (12:00 PM)',          DATE_ADD(CURDATE(), INTERVAL 3 DAY), '12:00:00', '15:00:00', 70, 65),
(6, 'Brunch (10:30 AM)',         DATE_ADD(CURDATE(), INTERVAL 2 DAY), '10:30:00', '13:30:00', 45, 42);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SAMPLE DATA: bookings
-- Two pre-existing demo bookings so the "My Bookings" page shows results.
-- Use these emails to search: chan.taiman@example.com / wong.meiling@example.com
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO bookings (booking_reference, package_id, session_id, customer_name, customer_email, customer_phone, guest_count, special_requests, total_price, status) VALUES
('BKG-001-001', 1, 1, 'Chan Tai Man',  'chan.taiman@example.com',  '852-91234567', 2, 'Vegetarian options please', 776.00,  'CONFIRMED'), -- 2 guests × HK$388 = HK$776
('BKG-001-002', 2, 3, 'Wong Mei Ling', 'wong.meiling@example.com', '852-92345678', 4, 'Celebrating birthday',      1192.00, 'CONFIRMED'); -- 4 guests × HK$298 = HK$1192

-- ═══════════════════════════════════════════════════════════════════════════════
-- SAMPLE DATA: contact_messages
-- Two demo contact messages to show how the contact form data is stored.
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO contact_messages (name, email, message, is_read) VALUES
('John Doe',   'john@example.com', 'I would like to book a table for 10 people', FALSE), -- Unread message.
('Jane Smith', 'jane@example.com', 'Do you offer gluten-free options?',           TRUE);  -- Already read by staff.

