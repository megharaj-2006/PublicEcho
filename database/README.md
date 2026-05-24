# PublicEcho: Database Project & Assessment Report

This folder houses the **Standalone SQL Submission Package** for the PublicEcho database project. It is designed to be assessed independently of the web application, providing all schemas, constraints, mock seed data, and a suite of complex demonstration queries.

---

## 1. Entity-Relationship (ER) Architecture

The PublicEcho database relies on a highly normalized relational model designed to maintain data integrity, enforce hierarchical administrative assignments, track complaint statuses dynamically, and collect multi-dimensional user feedback.

### Key Entities
*   **Users (`users`)**: Represents citizens filing complaints and administrators.
*   **Jurisdictions (`jurisdictions`)**: Represents geographical boundaries in a self-referencing hierarchy tree (Ward → City → District → State → National).
*   **Departments (`departments`)**: Represents public sectors (Water, Sanitation, Roads, Electricity, Safety) and houses their respective Service Level Agreements (SLAs in days).
*   **Officials (`officials`)**: Represents government representatives mapped to specific jurisdictions and specialties (departments).
*   **Grievances (`grievances`)**: The central transactional record, housing details of reported issues, coordinates, and current status.
*   **Assignments (`grievance_assignments`)**: Tracks which official is active, reassigned, or completed for a specific grievance.
*   **Status History (`grievance_status_history`)**: An immutable ledger capturing every status change for audit reporting.
*   **Escalations (`grievance_escalations`)**: Records historical details of grievances moved to higher jurisdictional authorities.
*   **Feedback Ratings (`feedback_ratings`)**: Stores multi-criteria ratings (Speed, Quality, Communication) logged by citizens for resolved grievances.

---

## 2. Normalization Breakdown

The schema strictly adheres to the third normal form (**3NF**) to eliminate redundancy and prevent update, deletion, and insertion anomalies:

*   **First Normal Form (1NF)**:
    *   All attributes contain atomic values (e.g., latitude and longitude are separate decimal numbers rather than combined coordinate strings).
    *   Every table contains a unique Primary Key (`id` with `AUTO_INCREMENT`).
*   **Second Normal Form (2NF)**:
    *   As all tables use single-column surrogate Primary Keys (`id`), there are no partial dependencies where an attribute depends on only part of a composite key.
*   **Third Normal Form (3NF)**:
    *   All non-key columns depend solely on the primary key, eliminating transitive dependencies. For example, rather than storing the official's office address or phone in the `grievances` table, we store the `official_id` which links to `officials`, keeping official details normalized inside their own relations.

---

## 3. Advanced Relational Constraints

To showcase deep knowledge of DBMS topics, the schema implements:
1.  **Self-Referencing Keys**: `jurisdictions.parent_id` points back to `jurisdictions.id` to establish a clean parent-child relationship representing administrative layers.
2.  **Cascade Referencing**: 
    *   `ON DELETE RESTRICT` on critical entities like `users` or `departments` prevents deleting active items if children references exist, avoiding orphaned records.
    *   `ON UPDATE CASCADE` ensures changes in keys propagate throughout dependent tables automatically.
3.  **Check Constraints & Range Validations**: 
    *   Enforces `rating_speed`, `rating_quality`, and `rating_communication` values to strictly lie between `1` and `5`.
    *   Maintains geographic integrity by checking latitude ranges (`-90` to `90`) and longitude ranges (`-180` to `180`).

---

## 4. Setup & Installation Instructions

To setup and import this database package:

### Method A: Using MySQL Command Line (CLI)
1.  Open your command prompt or terminal.
2.  Log in to your MySQL server:
    ```bash
    mysql -u root -p
    ```
3.  Create the database:
    ```sql
    CREATE DATABASE publicecho;
    USE publicecho;
    ```
4.  Import the schema script:
    ```bash
    mysql -u root -p publicecho < database/schema.sql
    ```
5.  Import the seed mock data:
    ```bash
    mysql -u root -p publicecho < database/seed.sql
    ```

### Method B: Using MySQL Workbench
1.  Open **MySQL Workbench** and establish a connection.
2.  Go to `File` → `Open SQL Script...` and select `database/schema.sql`. Run the script to create the database and tables.
3.  Open `database/seed.sql` and execute it to populate the mock database.
4.  Open `database/queries.sql` to execute the assessment queries and witness live reports!
