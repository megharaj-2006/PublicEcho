# 📢 PublicEcho: Public Grievance Redressal Portal

**PublicEcho** is a comprehensive, modern Web Application and Database Management System (DBMS) designed to streamline communication between citizens and government officials. It allows citizens to raise, upvote, and track local infrastructure or service grievances (e.g., roads, electricity, water supply, sanitation) while providing officials with structured workflows to accept, update, and resolve tasks according to Service Level Agreements (SLAs).

---

## 🚀 Key Features

### 👥 Citizen Features
*   **Multi-lingual Localization:** Dual-language UI support (e.g., English, Kannada) for enhanced accessibility.
*   **Secure Authentication:** Log in securely via email/password or using **Google OAuth** (powered by Firebase).
*   **Grievance Submission:** File details of public issues, select departments, specify locations, and map to local wards.
*   **Upvoting & Community Engagement:** Upvote existing public grievances to highlight high-priority issues and prevent duplicate filings.
*   **Resolution Feedback:** Rate resolved grievances from `1` to `5` based on **Speed**, **Quality**, and **Communication**.

### 💼 Official & Admin Workspaces
*   **Official Dashboard:** Secure workspace showing active grievances assigned specifically to the official's department (e.g., Water, Sanitation, Roads) and jurisdiction/ward.
*   **Workflow Actions:** A structured timeline to accept, reject (with reasoning), post regular updates, and mark complaints as resolved.
*   **Admin Console:** Management panel to verify/approve newly registering officials via OTP and review user accounts.
*   **Performance Metrics:** Analytical views tracking SLA compliance, resolution speed, and average citizen ratings.

### 📊 Public & Analytics View
*   **Explore Portal:** Search and filter public grievances by status, department, or location.
*   **Department Leaderboards:** Rankings showing the best-performing departments and wards based on resolution speed and customer satisfaction.

---

## 🛠️ Technology Stack

### Frontend
*   **Framework:** React (v18) with Vite
*   **Styling:** Tailwind CSS (fully responsive, custom theme)
*   **Authentication:** Firebase Client SDK (Google Auth integration)
*   **Icons:** Lucide React

### Backend
*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database Client:** `mysql2/promise` (utilizing connection pooling and raw SQL queries for efficiency)
*   **Security:** JSON Web Tokens (JWT) for session management, `bcryptjs` for password hashing, and CORS middleware for secure API calls.

### Database
*   **Engine:** MySQL
*   **Schema Design:** 3rd Normal Form (3NF) relational database.
*   **Integrity Features:** Self-referencing tables (for hierarchical jurisdictions: Ward → City → District → State), range checking constraints, and cascading foreign keys.

---

## 📂 Project Structure

```
├── backend/            # Express API server, routes, controllers, middleware, and database pooling config
├── database/           # Relational schemas (migrate.sql), seed data, and assessment documentation
├── frontend/           # React dashboard web application built with Vite and Tailwind CSS
└── README.md           # This project overview and setup file
```

---

## ⚙️ Getting Started & Local Setup

### Prerequisite
Ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v16 or higher)
*   [MySQL Server](https://dev.mysql.com/downloads/mysql/)

---

### 1. Database Setup

1.  Open your MySQL command-line client or MySQL Workbench.
2.  Create a database named `publicecho`:
    ```sql
    CREATE DATABASE publicecho;
    ```
3.  Import the database structure and seeds. In the `database/` directory, run the `migrate.sql` script to set up all tables, foreign keys, constraints, and initial mock data:
    ```bash
    mysql -u [your_mysql_user] -p publicecho < database/migrate.sql
    ```

---

### 2. Backend Configuration & Setup

1.  Navigate to the `backend/` folder:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file inside the `backend/` directory and configure your credentials:
    ```env
    PORT=5000
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_mysql_password
    DB_NAME=publicecho
    DB_PORT=3306
    JWT_SECRET=your_super_secret_jwt_key
    ```
4.  Start the Express server:
    ```bash
    npm run dev
    ```
    *The API will be available at:* `http://localhost:5000`

---

### 3. Frontend Configuration & Setup

1.  Navigate to the `frontend/` folder:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `frontend/` directory (refer to `.env.example` for details) and configure your API URL and Firebase settings:
    ```env
    VITE_API_URL=http://localhost:5000/api
    VITE_FIREBASE_API_KEY=your_firebase_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
    VITE_FIREBASE_APP_ID=your_firebase_app_id
    ```
4.  Start the Vite dev server:
    ```bash
    npm run dev
    ```
    *The frontend dashboard will open at:* `http://localhost:5173`

---

## 📜 License
This project is licensed under the ISC License.
