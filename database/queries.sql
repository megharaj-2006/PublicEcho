-- Assessment Queries Portfolio for PublicEcho
-- This script contains 5 advanced SQL queries designed to demonstrate a high-level mastery of RDBMS topics (Joins, Aggregations, Recursive CTEs, Date Math, and Audit Ledger Analytics).

USE publicecho;

-- =========================================================================
-- QUERY 1: MULTI-TABLE COMPLEX JOIN FOR ACTIVE ASSIGNMENTS
-- Purpose: Retrieves detailed profiles of all active assignments. 
-- Shows: Complaint title, department, reporter (citizen), assignee official, official's jurisdiction, and days open.
-- DBMS Concepts: Multi-table joins (6 tables), Date math (DATEDIFF).
-- =========================================================================

SELECT 
    g.id AS grievance_id,
    g.title AS complaint_title,
    d.name AS department_name,
    c.name AS citizen_reporter,
    o.name AS assigned_official,
    o.designation AS official_role,
    j.name AS current_jurisdiction_name,
    j.tier AS jurisdiction_tier,
    DATEDIFF(NOW(), g.created_at) AS days_open
FROM grievances g
INNER JOIN departments d ON g.department_id = d.id
INNER JOIN users c ON g.citizen_id = c.id
INNER JOIN jurisdictions j ON g.current_jurisdiction_id = j.id
INNER JOIN grievance_assignments ga ON g.id = ga.grievance_id
INNER JOIN officials o ON ga.official_id = o.id
WHERE ga.status = 'Active' AND g.status IN ('Assigned', 'In_Progress', 'Escalated')
ORDER BY days_open DESC;


-- =========================================================================
-- QUERY 2: OFFICIAL PERFORMANCE LEADERBOARD (AGGREGATION & COMPOSITE SCORING)
-- Purpose: Ranks resolving officials based on citizen feedback scores (1 to 5).
-- Shows: Total resolved cases, average speed, average quality, average communication, and a calculated overall weighted composite score.
-- DBMS Concepts: Aggregate functions (AVG, COUNT), Multi-variable math, GROUP BY, INNER JOINs.
-- =========================================================================

SELECT 
    o.id AS official_id,
    o.name AS official_name,
    o.designation AS designation,
    j.name AS jurisdiction,
    COUNT(fr.id) AS total_cases_rated,
    ROUND(AVG(fr.rating_speed), 2) AS avg_speed_score,
    ROUND(AVG(fr.rating_quality), 2) AS avg_quality_score,
    ROUND(AVG(fr.rating_communication), 2) AS avg_communication_score,
    -- Composite Score Formula: 40% Speed + 40% Quality + 20% Communication
    ROUND(
        (AVG(fr.rating_speed) * 0.40) + 
        (AVG(fr.rating_quality) * 0.40) + 
        (AVG(fr.rating_communication) * 0.20), 
        2
    ) AS composite_rating
FROM officials o
INNER JOIN feedback_ratings fr ON o.id = fr.official_id
INNER JOIN jurisdictions j ON o.jurisdiction_id = j.id
GROUP BY o.id, o.name, o.designation, j.name
ORDER BY composite_rating DESC;


-- =========================================================================
-- QUERY 3: HIERARCHICAL RECURSIVE CTE (JURISDICTION PATH TRACING)
-- Purpose: For any given local ward, trace its entire administrative parent branch
-- up to the central government. Excellent for mapping escalation targets.
-- DBMS Concepts: Recursive CTEs (Common Table Expressions) - highly praised in vival!
-- =========================================================================

WITH RECURSIVE JurisdictionPath AS (
    -- Anchor member: Select the initial local boundary (e.g., Ward 150 - Bellandur)
    SELECT id, name, tier, parent_id, 1 AS depth_level
    FROM jurisdictions
    WHERE id = 5 -- Ward 150 ID
    
    UNION ALL
    
    -- Recursive member: Join the anchor with its parent jurisdictions
    SELECT j.id, j.name, j.tier, j.parent_id, jp.depth_level + 1
    FROM jurisdictions j
    INNER JOIN JurisdictionPath jp ON j.id = jp.parent_id
)
SELECT 
    depth_level AS hierarchical_distance,
    name AS jurisdiction_name,
    tier AS administration_tier
FROM JurisdictionPath
ORDER BY hierarchical_distance ASC;


-- =========================================================================
-- QUERY 4: SLA BREACH DIAGNOSTIC & ESCALATION ANALYSIS
-- Purpose: Identifies unresolved complaints that have breached their category's SLA limit.
-- Shows: Title, Date Filed, SLA days, Deadline, and exact Days past SLA.
-- DBMS Concepts: Date arithmetic (DATE_ADD), conditional sorting, time delta comparisons.
-- =========================================================================

SELECT 
    g.id AS grievance_id,
    g.title AS complaint_title,
    d.name AS department,
    d.SLA_days,
    g.status AS current_status,
    g.created_at AS date_reported,
    DATE_ADD(g.created_at, INTERVAL d.SLA_days DAY) AS SLA_deadline,
    DATEDIFF(NOW(), DATE_ADD(g.created_at, INTERVAL d.SLA_days DAY)) AS days_overdue
FROM grievances g
INNER JOIN departments d ON g.department_id = d.id
WHERE g.status NOT IN ('Resolved') 
  AND NOW() > DATE_ADD(g.created_at, INTERVAL d.SLA_days DAY)
ORDER BY days_overdue DESC;


-- =========================================================================
-- QUERY 5: GRIEVANCE AUDIT HISTORY LOG (EVENT TIMELINE LEDGER)
-- Purpose: Generates a chronological step-by-step history log for a specific grievance.
-- Shows: Sequence, State changes (From -> To), changed by (citizen/official/system), and descriptive audit notes.
-- DBMS Concepts: Audit log design, subqueries/conditional mappings, formatting.
-- =========================================================================

SELECT 
    h.id AS step_number,
    h.previous_status AS status_from,
    h.new_status AS status_to,
    h.updated_by_role AS actor_role,
    CASE 
        WHEN h.updated_by_role = 'citizen' THEN (SELECT name FROM users WHERE id = h.updated_by_id)
        WHEN h.updated_by_role = 'official' THEN (SELECT name FROM officials WHERE id = h.updated_by_id)
        ELSE 'PublicEcho Automated System'
    END AS actor_name,
    h.notes AS event_notes,
    h.changed_at AS event_timestamp
FROM grievance_status_history h
WHERE h.grievance_id = 3 -- Target Grievance 3 (ORR Pothole)
ORDER BY h.changed_at ASC;
