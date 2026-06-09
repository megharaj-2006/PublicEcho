-- PublicEcho Large Seed File 1: Base structures & metadata
USE publicecho;

-- 1. Departments (15 total)
INSERT INTO `Departments` (`department_id`, `department_name`, `description`, `SLA_days`) VALUES
(0, 'General Administration', 'General administrative support, public grievances, VIP coordination', 7),
(1, 'Roads & Public Infrastructure', 'Potholes, broken roads, tarring, flyovers, subways', 7),
(2, 'Water Supply & Sewerage', 'Water pipeline leaks, low water pressure, borewells, sewage blockages', 3),
(3, 'Electricity & Streetlights', 'Streetlight outages, dangling electrical wires, power supply cuts', 2),
(4, 'Sanitation & Waste Management', 'Garbage overflow, street sweeping, illegal dumping, dry/wet waste collection', 2),
(5, 'Public Health & Safety', 'Vector-borne diseases, epidemic controls, food safety inspections', 4),
(6, 'Parks & Horticulture', 'Park maintenance, fallen trees, overgrown bushes, park lightning', 5),
(7, 'Storm Water Drain Management', 'Blocked drains, desilting, flooding, encroachments of storm water drains', 7),
(8, 'Building & Construction Violations', 'Encroachments, illegal commercial buildings, violation of bylaws', 10),
(9, 'Traffic & Transportation', 'Traffic lights malfunction, missing road signs, speed bumps, public transit issues', 5),
(10, 'Animal Control & Welfare', 'Stray dog menace, vaccination drives, cattle on roads, carcass removal', 3),
(11, 'Environment & Pollution Control', 'Industrial noise, lake pollution, burning of plastic, air quality issues', 6),
(12, 'Public Property Maintenance', 'Vandalism of government buildings, public toilet upkeep, broken fencing', 4),
(13, 'Revenue & Taxation', 'Property tax discrepancies, trade license queries, revenue assessments', 10),
(14, 'Citizen Services & Documentation', 'Birth/death certificate delays, Khata registration issues', 5)
ON DUPLICATE KEY UPDATE `department_name` = VALUES(`department_name`), `description` = VALUES(`description`), `SLA_days` = VALUES(`SLA_days`);

-- 2. Complaint Categories (20 total)
INSERT INTO `ComplaintCategories` (`category_id`, `category_name`) VALUES
(1, 'Pothole'),
(2, 'Water Leakage'),
(3, 'Garbage Overflow'),
(4, 'Streetlight Not Working'),
(5, 'Road Damage'),
(6, 'Water Supply Issue'),
(7, 'Illegal Dumping'),
(8, 'Traffic Signal Failure'),
(9, 'Blocked Drain'),
(10, 'Flooding'),
(11, 'Stray Dog Issue'),
(12, 'Dead Animal Removal'),
(13, 'Tree Fall'),
(14, 'Overgrown Vegetation'),
(15, 'Air Pollution'),
(16, 'Noise Pollution'),
(17, 'Illegal Construction'),
(18, 'Broken Footpath'),
(19, 'Public Toilet Issue'),
(20, 'Property Tax Issue')
ON DUPLICATE KEY UPDATE `category_name` = VALUES(`category_name`);

-- 3. Complaint Status (7 total)
INSERT INTO `ComplaintStatus` (`status_id`, `status_name`) VALUES
(1, 'Pending'),
(2, 'Assigned'),
(3, 'In Progress'),
(4, 'Resolved'),
(5, 'Rejected'),
(6, 'Escalated'),
(7, 'Closed')
ON DUPLICATE KEY UPDATE `status_name` = VALUES(`status_name`);

-- 4. Official Domains
INSERT INTO `official_domains` (`id`, `domain_name`) VALUES
(1, 'gov.in'),
(2, 'nic.in'),
(3, 'karnataka.gov.in'),
(4, 'bbmp.gov.in'),
(5, 'bescom.org'),
(6, 'bwssb.gov.in'),
(7, 'bda.gov.in'),
(8, 'bmrc.co.in'),
(9, 'ksrtc.in'),
(10, 'ksp.gov.in')
ON DUPLICATE KEY UPDATE `domain_name` = VALUES(`domain_name`);
