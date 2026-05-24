-- DML Seed Data Script for PublicEcho
-- Inserts initial structure: Jurisdictions, Departments, Official Domains, Officials, Citizens, Admin, Grievances, and Ratings

USE publicecho;

-- 1. Insert Departments with custom SLAs (in days)
INSERT INTO departments (id, name, SLA_days) VALUES
(1, 'Water Supply & Sewerage', 3),
(2, 'Sanitation & Waste Management', 2),
(3, 'Roads & Public Infrastructure', 7),
(4, 'Electricity & Streetlights', 2),
(5, 'Public Health & Safety', 4);

-- 2. Insert Hierarchical Jurisdictions
-- National Tier
INSERT INTO jurisdictions (id, name, tier, parent_id, official_email_domain) VALUES
(1, 'Central Government Authority', 'National', NULL, 'gov.in');

-- State Tier (Parent: National)
INSERT INTO jurisdictions (id, name, tier, parent_id, official_email_domain) VALUES
(2, 'State of Karnataka', 'State', 1, 'karnataka.gov.in');

-- District Tier (Parent: State)
INSERT INTO jurisdictions (id, name, tier, parent_id, official_email_domain) VALUES
(3, 'Bengaluru District Office', 'District', 2, 'bengaluru.nic.in');

-- City Tier (Parent: District)
INSERT INTO jurisdictions (id, name, tier, parent_id, official_email_domain) VALUES
(4, 'Bengaluru Municipal Corporation (BBMP)', 'City', 3, 'bbmp.gov.in');

-- Wards Tier (Parent: City)
INSERT INTO jurisdictions (id, name, tier, parent_id, official_email_domain) VALUES
(5, 'Ward 150 - Bellandur', 'Ward', 4, 'bbmp.gov.in'),
(6, 'Ward 174 - HSR Layout', 'Ward', 4, 'bbmp.gov.in');

-- 3. Insert Official Domains
INSERT INTO official_domains (id, domain_name) VALUES
(1, 'gov.in'),
(2, 'nic.in'),
(3, 'karnataka.gov.in'),
(4, 'bbmp.gov.in'),
(5, 'bescom.org'),
(6, 'bwssb.gov.in');

-- 4. Insert Citizens & System Admin in users table
-- Plaintext passwords:
-- Citizens: 'password123' ($2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi)
-- Admin Megharaj: 'Nmbangalore@5' ($2a$10$1i9wdXrI.kyuLUYyhLGRbOrY0onctjGrQw6mO2wXz7jaY93LOdpmm)
INSERT INTO users (id, name, email, password_hash, phone, role) VALUES
(1, 'Aravind Kumar', 'aravind.k@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9876543210', 'citizen'),
(2, 'Deepa Sridhar', 'deepa.s@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9812345678', 'citizen'),
(3, 'Rohan Sharma', 'rohan.s@gmail.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9900112233', 'citizen'),
(4, 'Megharaj', 'megharajmaruthi@gmail.com', '$2a$10$1i9wdXrI.kyuLUYyhLGRbOrY0onctjGrQw6mO2wXz7jaY93LOdpmm', '9999999999', 'admin');

-- 5. Insert Pre-Approved Officials (with status = 'Approved')
-- Password corresponds to plaintext 'official123' ($2a$10$N9qo8uLOqp.P09WJ14M4OeY7XjG6Kup2U4Z1Kq218R5v9iXG.kIeu)
-- Ward 150 (Bellandur) Department Officers
INSERT INTO officials (id, name, email, password_hash, jurisdiction_id, department_id, designation, status) VALUES
(1, 'Subhash Rao', 'subhash.rao@bbmp.gov.in', '$2a$10$N9qo8uLOqp.P09WJ14M4OeY7XjG6Kup2U4Z1Kq218R5v9iXG.kIeu', 5, 1, 'Ward 150 Water Engineer', 'Approved'),
(2, 'Manjula Gowda', 'manjula.g@bbmp.gov.in', '$2a$10$N9qo8uLOqp.P09WJ14M4OeY7XjG6Kup2U4Z1Kq218R5v9iXG.kIeu', 5, 2, 'Ward 150 Waste Inspector', 'Approved'),
(3, 'Kiran Kumar', 'kiran.k@bbmp.gov.in', '$2a$10$N9qo8uLOqp.P09WJ14M4OeY7XjG6Kup2U4Z1Kq218R5v9iXG.kIeu', 5, 3, 'Ward 150 Roads Inspector', 'Approved');

-- Ward 174 (HSR Layout) Department Officers
INSERT INTO officials (id, name, email, password_hash, jurisdiction_id, department_id, designation, status) VALUES
(4, 'Suresh Murthy', 'suresh.m@bbmp.gov.in', '$2a$10$N9qo8uLOqp.P09WJ14M4OeY7XjG6Kup2U4Z1Kq218R5v9iXG.kIeu', 6, 1, 'Ward 174 Water Engineer', 'Approved'),
(5, 'Anitha Reddy', 'anitha.r@bbmp.gov.in', '$2a$10$N9qo8uLOqp.P09WJ14M4OeY7XjG6Kup2U4Z1Kq218R5v9iXG.kIeu', 6, 2, 'Ward 174 Waste Inspector', 'Approved'),
(6, 'Ramesh Nair', 'ramesh.n@bbmp.gov.in', '$2a$10$N9qo8uLOqp.P09WJ14M4OeY7XjG6Kup2U4Z1Kq218R5v9iXG.kIeu', 6, 3, 'Ward 174 Roads Inspector', 'Approved');

-- Higher Tier Officials (No specific department_id, handles multi-sector escalations)
INSERT INTO officials (id, name, email, password_hash, jurisdiction_id, department_id, designation, status) VALUES
(7, 'Dr. Rajneesh Goel (IAS)', 'dc.blr@bengaluru.nic.in', '$2a$10$N9qo8uLOqp.P09WJ14M4OeY7XjG6Kup2U4Z1Kq218R5v9iXG.kIeu', 3, NULL, 'District Commissioner (DC)', 'Approved'),
(8, 'Satish Reddy (MLA)', 'mla.bommanahalli@karnataka.gov.in', '$2a$10$N9qo8uLOqp.P09WJ14M4OeY7XjG6Kup2U4Z1Kq218R5v9iXG.kIeu', 2, NULL, 'Member of Legislative Assembly (MLA)', 'Approved');

-- 6. Insert Grievances
-- Grievance 1: Water pipeline leak in Bellandur (Assigned and Active)
INSERT INTO grievances (id, title, description, image_url, department_id, citizen_id, current_jurisdiction_id, status, latitude, longitude, address, created_at) VALUES
(1, 'Severe Drinking Water Leakage', 'Clean drinking water is leaking from a main pipe joint onto the road near Bellandur lake gate. Hundreds of gallons wasted.', 'https://images.unsplash.com/photo-1542013936693-8848e574047e', 1, 1, 5, 'Assigned', 12.93040000, 77.67840000, 'Lake Gate Road, Bellandur, Bengaluru', NOW() - INTERVAL 1 DAY);

INSERT INTO grievance_assignments (grievance_id, official_id, assigned_at, status) VALUES
(1, 1, NOW() - INTERVAL 1 DAY, 'Active');

-- Grievance 2: Garbage heap in HSR Layout (Resolved)
INSERT INTO grievances (id, title, description, image_url, department_id, citizen_id, current_jurisdiction_id, status, latitude, longitude, address, created_at, updated_at) VALUES
(2, 'Piles of Commercial Garbage Unattended', 'Garbage from local eateries dumped on HSR 27th Main sidewalk. Severe bad smell and breeding mosquitoes.', 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9', 2, 2, 6, 'Resolved', 12.91050000, 77.64500000, '27th Main Rd, Sector 1, HSR Layout, Bengaluru', NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 2 DAY);

INSERT INTO grievance_assignments (grievance_id, official_id, assigned_at, resolved_at, status) VALUES
(2, 5, NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 2 DAY, 'Completed');

-- Insert citizen feedback rating for Resolved Grievance 2
INSERT INTO feedback_ratings (grievance_id, official_id, rating_speed, rating_quality, rating_communication, comment, created_at) VALUES
(2, 5, 5, 4, 5, 'Thank you! The sanitation department cleaned it up within 2 days of complaining. Great speed.', NOW() - INTERVAL 2 DAY);

-- Grievance 3: Giant Pothole on Bellandur ORR (Escalated due to SLA timeout)
INSERT INTO grievances (id, title, description, image_url, department_id, citizen_id, current_jurisdiction_id, status, latitude, longitude, address, created_at) VALUES
(3, 'Crater-Sized Pothole on Outer Ring Road', 'Extremely dangerous pothole near the flyover ramp. Multiple two-wheelers have met with minor accidents.', 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2', 3, 3, 3, 'Escalated', 12.93650000, 77.68300000, 'Outer Ring Road Flyover Ramp, Bellandur, Bengaluru', NOW() - INTERVAL 10 DAY);

-- Initially assigned to Ward 150 Roads Officer (Kiran Kumar - id 3)
INSERT INTO grievance_assignments (id, grievance_id, official_id, assigned_at, status) VALUES
(3, 3, 3, NOW() - INTERVAL 10 DAY, 'Reassigned');

-- Escalated to District Commissioner (IAS officer - id 7) 3 days ago after SLA breach
INSERT INTO grievance_assignments (id, grievance_id, official_id, assigned_at, status) VALUES
(4, 3, 7, NOW() - INTERVAL 3 DAY, 'Active');

INSERT INTO grievance_escalations (grievance_id, escalated_from_jurisdiction_id, escalated_to_jurisdiction_id, trigger_type, escalated_at) VALUES
(3, 5, 3, 'system_timeout', NOW() - INTERVAL 3 DAY);
