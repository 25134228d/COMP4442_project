# BuffetEase

BuffetEase is a Spring Boot buffet reservation website with static front-end pages and a MySQL-backed REST API for packages, sessions, bookings, and contact messages.

## Technologies Used

- Java 17
- Spring Boot 3.5.14
- Spring Web for REST controllers and HTTP endpoints
- MySQL 8.0.45
- Maven with the Spring Boot Maven plugin
- HTML, CSS, and JavaScript for the static pages
- Tailwind CSS from CDN for page styling
- Font Awesome for icons
- Google Fonts for the serif page typography

## Ubuntu Setup

The setup below matches the environment used in this project on Ubuntu.

### 1. Update the system

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Install Java 17 and Maven

```bash
sudo apt install openjdk-17-jdk
sudo update-alternatives --config java
sudo apt install maven
```

### 3. Install MySQL Server

```bash
sudo apt install mysql-server -y
```

### 4. Secure MySQL

Run the security script and follow the prompts.

```bash
sudo mysql_secure_installation
```

### 5. Create the database and application user

```bash
sudo mysql
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'admin123';
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;
```

### 6. Import the schema and sample data

```bash
mysql -u admin -p buffetease_db < schma.sql
```

The schema file is named `schma.sql` in this repository.

### 7. Run the application

```bash
./mvnw spring-boot:run
```

If the wrapper is not executable, run:

```bash
chmod +x mvnw
./mvnw spring-boot:run
```

### 8. Open the website

- Application: `http://localhost:8080`

## Configuration

- Server port: `8080`
- Database URL: `jdbc:mysql://localhost:3306/buffetease_db`
- Database username: `admin`
- Database password: `admin123`
- JPA mode: `validate`

## Project Structure

- `src/main/java` - Spring Boot backend code
- `src/main/resources/static` - HTML pages for the website
- `schma.sql` - Database schema and sample data

## Notes

- The static pages are served directly by Spring Boot.
- The backend expects MySQL to be running locally on port `3306`.
- If the application cannot connect to MySQL, check the username, password, and that the `buffetease_db` database exists.

## Kill port Kill the process running on port 8080 (If needed)
- kill -9 $(lsof -t -i:8080)
