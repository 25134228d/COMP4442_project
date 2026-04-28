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

### 1. Clone the Repository

```bash
git clone <repository-url>
cd COMP4442_project
```

### 2. MySQL Database Setup

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

#### Create Database

```bash
# Login to MySQL
sudo mysql -u root -p
# Enter password: root

# Create database (optional - application may auto-create)
mysql> CREATE DATABASE buffet_ease;
mysql> exit
```

### 3. Configure Application

Edit `src/main/resources/application.properties`:

```properties
# MySQL Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/buffet_ease
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# Server Configuration
server.port=8080
```

### 4. Build the Application

```bash
# Navigate to project root
cd /path/to/COMP4442_project

# Build with Maven
./mvnw clean install
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
