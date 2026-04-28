-- Create database
CREATE DATABASE IF NOT EXISTS buffetease_db;
USE buffetease_db;

-- Drop existing tables (optional - for fresh start)
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS packages;
DROP TABLE IF EXISTS contact_messages;

-- Create packages table
CREATE TABLE packages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    price_per_person DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table
CREATE TABLE sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    package_id BIGINT NOT NULL,
    session_label VARCHAR(50) NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_seats INT NOT NULL DEFAULT 50,
    available_seats INT NOT NULL DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE
);

-- Create bookings table
CREATE TABLE bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    package_id BIGINT NOT NULL,
    session_id BIGINT NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    guest_count INT NOT NULL DEFAULT 1,
    special_requests TEXT,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('CONFIRMED', 'CANCELLED') DEFAULT 'CONFIRMED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES packages(id),
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Create contact_messages table
CREATE TABLE contact_messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample packages
INSERT INTO packages (name, type, description, price_per_person, image_url) VALUES
('Signature Dinner Buffet', 'Dinner', 'An exquisite evening spread featuring live seafood station, premium carving station with roasted prime rib, and an indulgent dessert bar.', 388.00, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1000'),
('Weekend Brunch', 'Brunch', 'Perfect for lazy weekends! Includes free-flow sparkling wine, eggs benedict station, fresh seafood on ice, and a chocolate fountain.', 298.00, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=1000'),
('Premium Seafood Feast', 'Special', 'Crab, lobster, fresh oysters, and sushi counter. A seafood lover''s dream come true with unlimited premium catches.', 488.00, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&q=80&w=1000'),
('Luxury Afternoon Tea', 'Snack', 'An assortment of delicate pastries, finger sandwiches, and premium tea selection.', 188.00, 'https://images.unsplash.com/photo-1532376995628-4fa2d36b6b65?auto=format&fit=crop&q=80&w=1000'),
('Family Holiday Feast', 'Family', 'Perfect for families with kids. Includes carving station, pasta bar, desserts, and a kids'' corner.', 328.00, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1000'),
('Dim Sum Brunch', 'Chinese', 'Authentic Hong Kong dim sum experience with unlimited bamboo steamers, congee station, and Chinese tea pairing.', 268.00, 'https://images.unsplash.com/photo-1535069733846-51eae6b01b8c?auto=format&fit=crop&q=80&w=1000');

-- Insert sample sessions
INSERT INTO sessions (package_id, session_label, session_date, start_time, end_time, total_seats, available_seats) VALUES
(1, 'Early Dinner (6:00 PM)', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:00:00', '20:30:00', 50, 45),
(1, 'Late Dinner (8:30 PM)', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '20:30:00', '23:00:00', 50, 50),
(2, 'Brunch (11:30 AM)', DATE_ADD(CURDATE(), INTERVAL 6 DAY), '11:30:00', '14:30:00', 60, 60),
(3, 'Dinner (6:30 PM)', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '18:30:00', '21:30:00', 40, 40),
(4, 'Afternoon Tea (2:00 PM)', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00:00', '16:30:00', 30, 25),
(5, 'Lunch (12:00 PM)', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '12:00:00', '15:00:00', 70, 65),
(6, 'Brunch (10:30 AM)', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '10:30:00', '13:30:00', 45, 42);

-- Insert sample bookings
INSERT INTO bookings (booking_reference, package_id, session_id, customer_name, customer_email, customer_phone, guest_count, special_requests, total_price, status) VALUES
('BKG-001-001', 1, 1, 'Chan Tai Man', 'chan.taiman@example.com', '852-91234567', 2, 'Vegetarian options please', 776.00, 'CONFIRMED'),
('BKG-001-002', 2, 3, 'Wong Mei Ling', 'wong.meiling@example.com', '852-92345678', 4, 'Celebrating birthday', 1192.00, 'CONFIRMED');

-- Insert sample contact messages
INSERT INTO contact_messages (name, email, message, is_read) VALUES
('John Doe', 'john@example.com', 'I would like to book a table for 10 people', FALSE),
('Jane Smith', 'jane@example.com', 'Do you offer gluten-free options?', TRUE);
