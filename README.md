# BuffetEase

A modern web application for buffet restaurant reservations and package management, built with Spring Boot backend and vanilla JavaScript frontend.

## Table of Contents

- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [Running the Application](#running-the-application)

## Technologies Used

### Frontend

- **HTML5**: Semantic page structure across all webpage views
- **Tailwind CSS** (via CDN): Utility-first responsive styling implementation, using custom olive green `#4a7043` as theme and brand color
- **Font Awesome 6** (via CDN): UI elements implementation (utensils, star, clock, users, map-pin, phone, envelope)
- **Google Fonts**: 
  - PlayFair Display for serif headings
  - Inter for body text
- **Vanilla JavaScript**: DOM manipulation, event handling, form validation, modal handling, and localStorage persistence for guest reservation ID

### Backend

- **Java 17**: Primary language for backend development
- **Spring Boot 3**: REST controller scaffolding using spring-boot-starter-web, embedded in Tomcat server
- **Maven 3.9**: Build automation and dependency management through pom.xml
- **Spring Data JPA + Hibernate**: Complete Object/Relational Mapping (ORM) layer with entities, repositories, services, and DTOs for robust data persistence
- **MySQL 8.0**: Primary database, configured using application.properties with schema.sql for schema configuration, ready for AWS RDS deployment

## Prerequisites

Before you begin, ensure you have the following installed:

- **Java 17 or higher**
- **Maven 3.9 or higher**
- **MySQL 8.0 or higher**
- **Git** (for version control)

## Installation & Setup

### 1. Install Java 17

On Ubuntu/Linux:
```bash
# Install OpenJDK 17
sudo apt install openjdk-17-jdk

# Set Java 17 as default (if multiple Java versions exist)
sudo update-alternatives --config java

# Verify installation
java -version
```

### 2. Install Maven

On Ubuntu/Linux:
```bash
# Install Maven
sudo apt install maven

# Verify installation
mvn -version
```

### 3. Clone the Repository

```bash
git clone <repository-url>
cd COMP4442_project
```

### 4. MySQL Database Setup

#### Install MySQL Server

```bash
# Update package list
sudo apt update && sudo apt upgrade -y

# Install MySQL Server
sudo apt install mysql-server -y

# Run the security script
sudo mysql_secure_installation
```

#### Secure MySQL Installation

When prompted during `mysql_secure_installation`:
- **VALIDATE PASSWORD COMPONENT**: No (n)
- **Remove anonymous users**: No (n)
- **Disallow root login remotely**: No (n)
- **Remove test database**: No (n)
- **Reload privilege tables**: Yes (y)

#### Configure MySQL Root Password

```bash
# Start MySQL service
sudo systemctl start mysql

# Enable MySQL to start on boot
sudo systemctl enable mysql

# Connect to MySQL
sudo mysql

# Set root password for password-based authentication
mysql> ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
mysql> exit
```

#### Initialize Database with Schema

The project includes a `schema.sql` file that creates all necessary tables and inserts sample data.

**Method 1: Using MySQL command line**

```bash
# Login to MySQL
sudo mysql -u root -p
# Enter password: root
```

Once logged in, paste the entire content from `schema.sql` file:

```sql
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

-- Insert sample data (see schema.sql for complete data)
```

Then exit MySQL:
```bash
mysql> exit
```

**Method 2: Using file import (faster)**

```bash
# Execute schema.sql file directly
sudo mysql -u root -p < schema.sql
# Enter password: root
```

**Verify Database Setup:**

```bash
# Login to MySQL
sudo mysql -u root -p
# Enter password: root

# Check if database exists
mysql> SHOW DATABASES;

# Use the database
mysql> USE buffetease_db;

# Check tables
mysql> SHOW TABLES;

# Exit
mysql> exit
```

### 5. Configure Application

Edit `src/main/resources/application.properties`:

```properties
# MySQL Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/buffetease_db
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# Server Configuration
server.port=8080
```

**Note:** Use `spring.jpa.hibernate.ddl-auto=validate` after running schema.sql to ensure the database schema matches your entities.

### 6. Build the Application

```bash
# Navigate to project root
cd /path/to/COMP4442_project

# Build with Maven
mvn clean install
```

Or on Windows:
```bash
mvnw.cmd clean install
```

## Project Structure

```
COMP4442_project/
├── src/
│   ├── main/
│   │   ├── java/com/buffetease/buffet_ease/
│   │   │   ├── BuffetEaseApplication.java
│   │   │   ├── config/
│   │   │   │   └── CorsConfig.java
│   │   │   ├── controller/
│   │   │   │   ├── BookingController.java
│   │   │   │   ├── ContactController.java
│   │   │   │   └── PackageController.java
│   │   │   ├── dto/
│   │   │   │   ├── BookingRequestDTO.java
│   │   │   │   ├── BookingResponseDTO.java
│   │   │   │   ├── ContactRequestDTO.java
│   │   │   │   ├── PackageResponseDTO.java
│   │   │   │   └── SessionResponseDTO.java
│   │   │   ├── exception/
│   │   │   │   ├── BusinessException.java
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   ├── model/
│   │   │   │   ├── Booking.java
│   │   │   │   ├── ContactMessage.java
│   │   │   │   ├── Package.java
│   │   │   │   ├── Session.java
│   │   │   │   └── enums/
│   │   │   │       └── BookingStatus.java
│   │   │   ├── repository/
│   │   │   │   ├── BookingRepository.java
│   │   │   │   ├── ContactMessageRepository.java
│   │   │   │   ├── PackageRepository.java
│   │   │   │   └── SessionRepository.java
│   │   │   └── service/
│   │   │       ├── BookingService.java
│   │   │       ├── ContactService.java
│   │   │       └── PackageService.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── static/
│   │           ├── index.html
│   │           ├── packages.html
│   │           ├── my-bookings.html
│   │           ├── about.html
│   │           └── testapi.html
│   └── test/
│       └── java/com/buffetease/buffet_ease/
│           └── BuffetEaseApplicationTests.java
├── pom.xml
├── schema.sql
└── README.md
```

## Running the Application

### Start the Application

On Ubuntu/Linux:
```bash
# Navigate to project root
cd /path/to/COMP4442_project

# Run the Spring Boot application
mvn spring-boot:run
```

### Stop the Application

To stop the running application, use:
```bash
# Kill the process running on port 8080
kill -9 $(lsof -t -i:8080)
```

Or on Windows:
```bash
mvnw.cmd spring-boot:run
```

### Access the Application

Once the application is running:

- **Frontend**: http://localhost:8080
- **API Base URL**: http://localhost:8080/api

### API Endpoints

- **Bookings**: `/api/bookings`
- **Packages**: `/api/packages`
- **Contacts**: `/api/contacts`
- **Sessions**: `/api/sessions`

## Features

- ✅ Browse restaurant packages
- ✅ Make and manage reservations
- ✅ Contact form for inquiries
- ✅ Responsive design for mobile and desktop
- ✅ Persistent booking history with localStorage
- ✅ RESTful API backend with comprehensive error handling

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Database Deployment

The application is pre-configured for AWS RDS MySQL deployment. To deploy:

1. Update connection details in `application.properties`
2. Configure security groups to allow MySQL connections
3. Run database initialization scripts if needed

## Successful Setup Verification

After following all the installation steps above, you should see output similar to this:

```bash
test@test-VMware-Virtual-Platform:~$ sudo systemctl start mysql
test@test-VMware-Virtual-Platform:~$ sudo systemctl enable mysql
Synchronizing state of mysql.service with SysV service script with /usr/lib/systemd/systemd-sysv-install.
Executing: /usr/lib/systemd/systemd-sysv-install enable mysql

test@test-VMware-Virtual-Platform:~$ sudo mysql -u root -p
Enter password: [root]
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 11
Server version: 8.0.45-0ubuntu0.24.04.1 (Ubuntu)

mysql> exit
Bye
```

## Troubleshooting

### MySQL Connection Issues

```bash
# Verify MySQL is running
sudo systemctl status mysql

# Check MySQL version
mysql --version

# Test connection
mysql -u root -p
```

### Port Already in Use

If port 8080 is already in use, modify `application.properties`:
```properties
server.port=8081
```

### Build Errors

```bash
# Clean and rebuild
./mvnw clean
./mvnw install
```

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## License

This project is part of COMP4442 coursework.

## Support

For issues or questions, please contact the development team.
