-- Re-build the publicecho database matching the recommended project schema
DROP DATABASE IF EXISTS publicecho;
CREATE DATABASE publicecho;
USE publicecho;

-- 1. Roles Table
CREATE TABLE Roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

-- 2. Users Table
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES Roles(role_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 3. Departments Table
CREATE TABLE Departments (
    department_id INT PRIMARY KEY AUTO_INCREMENT,
    department_name VARCHAR(100) NOT NULL,
    description TEXT
) ENGINE=InnoDB;

-- 4. Wards Table
CREATE TABLE Wards (
    ward_id INT PRIMARY KEY,
    ward_name VARCHAR(100) NOT NULL,
    zone_name VARCHAR(100),
    city VARCHAR(100) DEFAULT 'Bengaluru'
) ENGINE=InnoDB;

-- 5. Officials Table
CREATE TABLE Officials (
    official_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    department_id INT NULL DEFAULT 0,
    ward_id INT NOT NULL,
    designation VARCHAR(100),
    office_address TEXT NULL,
    status ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
    office_id_proof LONGTEXT NULL,
    photo_proof LONGTEXT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (department_id) REFERENCES Departments(department_id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (ward_id) REFERENCES Wards(ward_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 6. Complaint Categories Table
CREATE TABLE ComplaintCategories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- 7. Complaint Status Table
CREATE TABLE ComplaintStatus (
    status_id INT PRIMARY KEY AUTO_INCREMENT,
    status_name VARCHAR(50) NOT NULL
) ENGINE=InnoDB;

-- 8. Complaints Table
CREATE TABLE Complaints (
    complaint_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    status_id INT NOT NULL,
    ward_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url LONGTEXT NULL,
    solution_image_url LONGTEXT NULL,
    solution_description TEXT NULL,
    address VARCHAR(255) NULL,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (category_id) REFERENCES ComplaintCategories(category_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (status_id) REFERENCES ComplaintStatus(status_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (ward_id) REFERENCES Wards(ward_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 9. Complaint Assignments Table
CREATE TABLE ComplaintAssignments (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT,
    complaint_id INT NOT NULL,
    official_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (complaint_id) REFERENCES Complaints(complaint_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (official_id) REFERENCES Officials(official_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 10. Notifications Table
CREATE TABLE Notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    complaint_id INT,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (complaint_id) REFERENCES Complaints(complaint_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 11. Complaint Upvotes Table
CREATE TABLE ComplaintUpvotes (
    upvote_id INT PRIMARY KEY AUTO_INCREMENT,
    complaint_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_complaint_user (complaint_id, user_id),
    FOREIGN KEY (complaint_id) REFERENCES Complaints(complaint_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 12. Complaint Updates Table
CREATE TABLE ComplaintUpdates (
    update_id INT PRIMARY KEY AUTO_INCREMENT,
    complaint_id INT NOT NULL,
    update_message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES Complaints(complaint_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 13. Official Domains Table
CREATE TABLE official_domains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    domain_name VARCHAR(100) UNIQUE NOT NULL
) ENGINE=InnoDB;


-- ==================== SEED INITIAL DATA ====================

-- Roles
INSERT INTO Roles (role_name) VALUES ('citizen'), ('official'), ('admin');

-- Disable auto value on zero to allow department_id = 0
SET SESSION SQL_MODE='NO_AUTO_VALUE_ON_ZERO';
INSERT INTO Departments (department_id, department_name, description) VALUES (0, 'General', 'General municipal problems, MLAs, MPs, and administrators');

-- Departments
INSERT INTO Departments (department_name, description) VALUES
('Road Department', 'Handles potholes and road damage'),
('Water Department', 'Handles water leakage and supply complaints'),
('Electricity Department', 'Handles streetlight and power complaints'),
('Sanitation Department', 'Handles garbage and cleanliness issues');

-- Bengaluru Wards
INSERT INTO Wards (ward_id, ward_name, zone_name) VALUES
(5, 'Jakkur', 'Byatarayanapura'),
(6, 'Thanisandra', 'Byatarayanapura'),
(11, 'Kuvempunagar', 'Byatarayanapura'),
(24, 'HBR Layout', 'East Zone'),
(25, 'Horamavu', 'Mahadevapura'),
(45, 'Malleshwaram', 'West Zone'),
(63, 'Jayamahal', 'East Zone'),
(70, 'Rajagopalanagar', 'Dasarahalli'),
(71, 'Hegganahalli', 'Dasarahalli'),
(104, 'Govindarajanagar', 'South Zone'),
(111, 'Shanthalanagar', 'East Zone'),
(112, 'Domlur', 'East Zone'),
(125, 'Marenahalli', 'South Zone'),
(126, 'Maruthi Mandira', 'South Zone'),
(149, 'Varthur', 'Mahadevapura'),
(150, 'Bellandur', 'Mahadevapura'),
(151, 'Koramangala', 'South Zone'),
(152, 'Sudduguntepalya', 'South Zone'),
(153, 'Jayanagar', 'South Zone'),
(154, 'Basavanagudi', 'South Zone');

-- Complaint Categories
INSERT INTO ComplaintCategories (category_name) VALUES
('Pothole'),
('Water Leakage'),
('Garbage Overflow'),
('Streetlight Not Working');

-- Complaint Status
INSERT INTO ComplaintStatus (status_name) VALUES
('Pending'),
('Assigned'),
('In Progress'),
('Resolved'),
('Rejected');

-- Official Domains
INSERT INTO official_domains (domain_name) VALUES
('gov.in'), ('nic.in'), ('karnataka.gov.in'), ('bbmp.gov.in'), ('bescom.org'), ('bwssb.gov.in');

-- Admin Users (password: Nmbangalore@5)
INSERT INTO Users (name, email, password_hash, phone, role_id) VALUES
('System Admin', 'admin@portal.com', '$2a$10$1i9wdXrI.kyuLUYyhLGRbOrY0onctjGrQw6mO2wXz7jaY93LOdpmm', '9999999999', 3),
('Megharaj', 'megharajmaruthi@gmail.com', '$2a$10$1i9wdXrI.kyuLUYyhLGRbOrY0onctjGrQw6mO2wXz7jaY93LOdpmm', '9999999998', 3);

-- Citizen Users (password: password123)
INSERT INTO Users (name, email, password_hash, phone, role_id) VALUES
('Aravind Kumar', 'aravind.k@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9876543210', 1),
('Deepa Sridhar', 'deepa.s@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9812345678', 1),
('Rohan Sharma', 'rohan.s@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9900112233', 1);

-- Official Users (password: official123)
INSERT INTO Users (name, email, password_hash, phone, role_id) VALUES
('Rahul Sharma', 'rahul@bbmp.gov.in', '$2a$10$N9qo8uLOqp.P09WJ14M4OeY7XjG6Kup2U4Z1Kq218R5v9iXG.kIeu', '9876543201', 2),
('Priya Nair', 'priya@bbmp.gov.in', '$2a$10$N9qo8uLOqp.P09WJ14M4OeY7XjG6Kup2U4Z1Kq218R5v9iXG.kIeu', '9876543202', 2),
('Arjun Rao', 'arjun@bbmp.gov.in', '$2a$10$N9qo8uLOqp.P09WJ14M4OeY7XjG6Kup2U4Z1Kq218R5v9iXG.kIeu', '9876543203', 2),
('Sneha Verma', 'sneha@bbmp.gov.in', '$2a$10$N9qo8uLOqp.P09WJ14M4OeY7XjG6Kup2U4Z1Kq218R5v9iXG.kIeu', '9876543204', 2);

-- Officials Profiles
INSERT INTO Officials (user_id, department_id, ward_id, designation, office_address, status) VALUES
(6, 1, 150, 'Road Inspector', 'Roads Office, Ward 150, Bellandur, Bengaluru', 'Approved'),
(7, 2, 151, 'Water Officer', 'Water Board, Ward 151, Koramangala, Bengaluru', 'Approved'),
(8, 3, 112, 'Electricity Officer', 'BESCOM, Ward 112, Domlur, Bengaluru', 'Approved'),
(9, 4, 45, 'Sanitation Supervisor', 'BBMP Office, Ward 45, Malleshwaram, Bengaluru', 'Approved');

-- Seed Sample Complaints
INSERT INTO Complaints (user_id, category_id, status_id, ward_id, title, description, latitude, longitude, image_url) VALUES
(3, 1, 1, 150, 'Large pothole near Bellandur signal', 'Road damaged causing traffic issues. Highly dangerous for two-wheelers.', 12.9279000, 77.6762000, 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2'),
(4, 3, 1, 45, 'Garbage not cleared', 'Garbage pile not cleared for 5 days near the residential colony.', 12.9890000, 77.5713000, 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9');
