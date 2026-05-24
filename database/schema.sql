-- DDL Schema Script for PublicEcho
-- Enforces schemas, keys, constraints, and audit automation triggers

DROP DATABASE IF EXISTS publicecho;
CREATE DATABASE publicecho;
USE publicecho;

-- 1. Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role ENUM('citizen', 'admin') NOT NULL DEFAULT 'citizen',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Jurisdictions Table (Hierarchical Geography - Self-Referential)
CREATE TABLE jurisdictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    tier ENUM('Ward', 'City', 'District', 'State', 'National') NOT NULL,
    parent_id INT NULL,
    official_email_domain VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES jurisdictions(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 3. Departments Table (Administrative Sectors)
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    SLA_days INT NOT NULL DEFAULT 7,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Official Domains Table
CREATE TABLE official_domains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    domain_name VARCHAR(100) UNIQUE NOT NULL
) ENGINE=InnoDB;

-- 5. Officials Table
CREATE TABLE officials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    jurisdiction_id INT NOT NULL,
    department_id INT NULL, -- Nullable for general officials (e.g., MP, MLA, District Commissioner)
    designation VARCHAR(100) NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
    office_id_proof LONGTEXT NULL,
    photo_proof LONGTEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (jurisdiction_id) REFERENCES jurisdictions(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 6. Grievances Table (Complaint ledger)
CREATE TABLE grievances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    image_url LONGTEXT NULL,
    department_id INT NOT NULL,
    citizen_id INT NOT NULL,
    current_jurisdiction_id INT NOT NULL,
    status ENUM('Reported', 'Assigned', 'In_Progress', 'Resolved', 'Escalated') NOT NULL DEFAULT 'Reported',
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_latitude CHECK (latitude BETWEEN -90.00000000 AND 90.00000000),
    CONSTRAINT chk_longitude CHECK (longitude BETWEEN -180.00000000 AND 180.00000000),
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (citizen_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (current_jurisdiction_id) REFERENCES jurisdictions(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 6. Grievance Assignments Table
CREATE TABLE grievance_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grievance_id INT NOT NULL,
    official_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    status ENUM('Active', 'Completed', 'Reassigned') NOT NULL DEFAULT 'Active',
    FOREIGN KEY (grievance_id) REFERENCES grievances(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (official_id) REFERENCES officials(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 7. Grievance Status History Table (Audit logging)
CREATE TABLE grievance_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grievance_id INT NOT NULL,
    previous_status ENUM('Reported', 'Assigned', 'In_Progress', 'Resolved', 'Escalated') NULL,
    new_status ENUM('Reported', 'Assigned', 'In_Progress', 'Resolved', 'Escalated') NOT NULL,
    updated_by_role ENUM('citizen', 'official', 'system') NOT NULL,
    updated_by_id INT NOT NULL,
    notes TEXT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grievance_id) REFERENCES grievances(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 8. Grievance Escalations Table
CREATE TABLE grievance_escalations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grievance_id INT NOT NULL,
    escalated_from_jurisdiction_id INT NOT NULL,
    escalated_to_jurisdiction_id INT NOT NULL,
    trigger_type ENUM('system_timeout', 'user_approved') NOT NULL,
    escalated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grievance_id) REFERENCES grievances(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (escalated_from_jurisdiction_id) REFERENCES jurisdictions(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (escalated_to_jurisdiction_id) REFERENCES jurisdictions(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 9. Feedback Ratings Table
CREATE TABLE feedback_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grievance_id INT NOT NULL UNIQUE,
    official_id INT NOT NULL,
    rating_speed TINYINT NOT NULL,
    rating_quality TINYINT NOT NULL,
    rating_communication TINYINT NOT NULL,
    comment TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_rating_speed CHECK (rating_speed BETWEEN 1 AND 5),
    CONSTRAINT chk_rating_quality CHECK (rating_quality BETWEEN 1 AND 5),
    CONSTRAINT chk_rating_comm CHECK (rating_communication BETWEEN 1 AND 5),
    FOREIGN KEY (grievance_id) REFERENCES grievances(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (official_id) REFERENCES officials(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 10. Grievance Upvotes Table (Supports upvoting popular civic issues)
CREATE TABLE grievance_upvotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grievance_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_grievance_user (grievance_id, user_id),
    FOREIGN KEY (grievance_id) REFERENCES grievances(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 10. Performance Indexes for Optimization
CREATE INDEX idx_grievance_status ON grievances(status);
CREATE INDEX idx_grievance_coords ON grievances(latitude, longitude);
CREATE INDEX idx_jurisdiction_tier ON jurisdictions(tier);

-- 11. Automation Triggers for Audit State Machine

DELIMITER //

-- Trigger: Automatically logs the initial state when a complaint is reported
CREATE TRIGGER trg_after_grievance_insert
AFTER INSERT ON grievances
FOR EACH ROW
BEGIN
    INSERT INTO grievance_status_history (
        grievance_id, 
        previous_status, 
        new_status, 
        updated_by_role, 
        updated_by_id, 
        notes
    )
    VALUES (
        NEW.id, 
        NULL, 
        'Reported', 
        'citizen', 
        NEW.citizen_id, 
        'Complaint initially registered in the system.'
    );
END//

-- Trigger: Automatically audit logs any state updates
CREATE TRIGGER trg_after_grievance_update
AFTER UPDATE ON grievances
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO grievance_status_history (
            grievance_id, 
            previous_status, 
            new_status, 
            updated_by_role, 
            updated_by_id, 
            notes
        )
        VALUES (
            NEW.id, 
            OLD.status, 
            NEW.status, 
            CASE 
                WHEN NEW.status = 'Escalated' THEN 'system'
                ELSE 'official'
            END,
            COALESCE(
                (SELECT official_id FROM grievance_assignments WHERE grievance_id = NEW.id AND status = 'Active' LIMIT 1), 
                NEW.citizen_id
            ),
            CONCAT('Status updated from ', OLD.status, ' to ', NEW.status, '.')
        );
    END IF;
END//

DELIMITER ;
