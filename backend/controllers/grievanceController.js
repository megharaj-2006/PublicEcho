const db = require('../config/db');

// Helper to determine ward based on coordinates
// Simulates spatial routing: Ward 150 (Bellandur) vs Ward 174 (HSR Layout)
function getWardJurisdictionId(lat, lng) {
  const latitude = parseFloat(lat);
  // Boundary check: If latitude > 12.92, assign to Bellandur (5), else HSR Layout (6)
  return latitude > 12.92 ? 5 : 6;
}

// 1. Create a New Grievance (With Intelligent Routing)
const createGrievance = async (req, res) => {
  const { title, description, department_id, latitude, longitude, address, image_url } = req.body;
  const citizen_id = req.user.id;

  if (!title || !description || !department_id || !latitude || !longitude || !address) {
    return res.status(400).json({ message: 'All fields are required to report a grievance.' });
  }

  // Get database connection for atomic transaction
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // A. Geographically route to appropriate ward (Ward 150 or Ward 174)
    const wardId = getWardJurisdictionId(latitude, longitude);

    // B. Find official matching the ward and selected department
    const [matchingOfficials] = await connection.query(
      'SELECT id, name FROM officials WHERE jurisdiction_id = ? AND department_id = ? LIMIT 1',
      [wardId, department_id]
    );

    let status = 'Reported';
    let assignedOfficialId = null;

    if (matchingOfficials.length > 0) {
      status = 'Assigned';
      assignedOfficialId = matchingOfficials[0].id;
    }

    // C. Insert grievance record
    const [grievanceResult] = await connection.query(
      `INSERT INTO grievances (title, description, image_url, department_id, citizen_id, current_jurisdiction_id, status, latitude, longitude, address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, image_url || null, department_id, citizen_id, wardId, status, latitude, longitude, address]
    );

    const grievanceId = grievanceResult.insertId;

    // D. If an official was found, record active assignment
    if (assignedOfficialId) {
      await connection.query(
        'INSERT INTO grievance_assignments (grievance_id, official_id, status) VALUES (?, ?, ?)',
        [grievanceId, assignedOfficialId, 'Active']
      );
    }

    // Note: Inserting into grievance_status_history is handled AUTOMATICALLY by our MySQL trigger trg_after_grievance_insert!

    await connection.commit();
    res.status(201).json({
      message: 'Grievance registered and routed successfully.',
      grievanceId,
      status,
      routedToWard: wardId === 5 ? 'Ward 150 - Bellandur' : 'Ward 174 - HSR Layout',
      assignedTo: assignedOfficialId ? 'Local Ward Engineer' : 'General City Pool'
    });
  } catch (err) {
    await connection.rollback();
    console.error('Create Grievance Error:', err);
    res.status(500).json({ message: 'Failed to file grievance', error: err.message });
  } finally {
    connection.release();
  }
};

// 2. Fetch Citizen's Reported Grievance Dashboard
const getCitizenDashboard = async (req, res) => {
  const citizen_id = req.user.id;

  try {
    // Select grievances along with department names, current jurisdictions, and assigned official info
    const [grievances] = await db.query(
      `SELECT g.*, d.name AS department_name, d.SLA_days,
              j.name AS jurisdiction_name, j.tier AS jurisdiction_tier,
              o.name AS assigned_official_name, o.designation AS assigned_official_designation
       FROM grievances g
       INNER JOIN departments d ON g.department_id = d.id
       INNER JOIN jurisdictions j ON g.current_jurisdiction_id = j.id
       LEFT JOIN grievance_assignments ga ON g.id = ga.grievance_id AND ga.status = 'Active'
       LEFT JOIN officials o ON ga.official_id = o.id
       WHERE g.citizen_id = ?
       ORDER BY g.created_at DESC`,
      [citizen_id]
    );

    res.json(grievances);
  } catch (err) {
    console.error('Fetch Citizen Dashboard Error:', err);
    res.status(500).json({ message: 'Failed to retrieve grievances', error: err.message });
  }
};

// 3. Fetch Official's Action Dashboard (Multi-Tier Hierarchical Query)
const getOfficialDashboard = async (req, res) => {
  const official_id = req.user.id;
  const { jurisdiction_id, department_id, jurisdiction_tier } = req.user;

  try {
    let grievancesQuery = '';
    let queryParams = [];

    // If official belongs to a local ward, fetch issues matching that ward (and department if specific)
    if (jurisdiction_tier === 'Ward') {
      if (department_id) {
        grievancesQuery = `
          SELECT g.*, d.name AS department_name, d.SLA_days, j.name AS jurisdiction_name,
                 u.name AS citizen_name, u.phone AS citizen_phone
          FROM grievances g
          INNER JOIN departments d ON g.department_id = d.id
          INNER JOIN jurisdictions j ON g.current_jurisdiction_id = j.id
          INNER JOIN users u ON g.citizen_id = u.id
          INNER JOIN grievance_assignments ga ON g.id = ga.grievance_id
          WHERE ga.official_id = ? AND ga.status = 'Active' AND g.status != 'Resolved'
        `;
        queryParams = [official_id];
      } else {
        // General Ward Officer (unlikely, but safe backup)
        grievancesQuery = `
          SELECT g.*, d.name AS department_name, d.SLA_days, j.name AS jurisdiction_name,
                 u.name AS citizen_name, u.phone AS citizen_phone
          FROM grievances g
          INNER JOIN departments d ON g.department_id = d.id
          INNER JOIN jurisdictions j ON g.current_jurisdiction_id = j.id
          INNER JOIN users u ON g.citizen_id = u.id
          WHERE g.current_jurisdiction_id = ? AND g.status != 'Resolved'
        `;
        queryParams = [jurisdiction_id];
      }
    } else {
      // HIGHER TIERS (District, State, National e.g., District Commissioner or MLA)
      // These officials do not have specific departments. They handle all escalated complaints falling under their administrative tree!
      // Recursive hierarchical inclusion list matching current_jurisdiction_id in the tree:
      grievancesQuery = `
        SELECT g.*, d.name AS department_name, d.SLA_days, j.name AS jurisdiction_name,
               u.name AS citizen_name, u.phone AS citizen_phone, j.tier AS jurisdiction_tier,
               ga.status AS assignment_status
        FROM grievances g
        INNER JOIN departments d ON g.department_id = d.id
        INNER JOIN jurisdictions j ON g.current_jurisdiction_id = j.id
        INNER JOIN users u ON g.citizen_id = u.id
        INNER JOIN grievance_assignments ga ON g.id = ga.grievance_id AND ga.official_id = ?
        WHERE ga.status = 'Active' AND g.status != 'Resolved'
      `;
      queryParams = [official_id];
    }

    const [grievances] = await db.query(grievancesQuery, queryParams);

    // Retrieve stats
    const [stats] = await db.query(
      `SELECT 
         SUM(CASE WHEN g.status = 'Assigned' THEN 1 ELSE 0 END) as pending_count,
         SUM(CASE WHEN g.status = 'In_Progress' THEN 1 ELSE 0 END) as active_count,
         SUM(CASE WHEN g.status = 'Escalated' THEN 1 ELSE 0 END) as escalated_count,
         COUNT(g.id) as total_count
       FROM grievances g
       INNER JOIN grievance_assignments ga ON g.id = ga.grievance_id
       WHERE ga.official_id = ? AND ga.status = 'Active'`,
      [official_id]
    );

    res.json({
      grievances,
      stats: stats[0] || { pending_count: 0, active_count: 0, escalated_count: 0, total_count: 0 }
    });
  } catch (err) {
    console.error('Fetch Official Dashboard Error:', err);
    res.status(500).json({ message: 'Failed to retrieve work items', error: err.message });
  }
};

// 4. Get Status Audit Logs for Timeline view
const getGrievanceTimeline = async (req, res) => {
  const { id } = req.params;

  try {
    const [timeline] = await db.query(
      `SELECT h.*,
         CASE 
           WHEN h.updated_by_role = 'citizen' THEN (SELECT name FROM users WHERE id = h.updated_by_id)
           WHEN h.updated_by_role = 'official' THEN (SELECT name FROM officials WHERE id = h.updated_by_id)
           ELSE 'PublicEcho Automated System'
         END AS actor_name
       FROM grievance_status_history h
       WHERE h.grievance_id = ?
       ORDER BY h.changed_at ASC`,
      [id]
    );

    res.json(timeline);
  } catch (err) {
    console.error('Timeline Error:', err);
    res.status(500).json({ message: 'Failed to fetch timeline logs', error: err.message });
  }
};

// 5. Update Grievance Status (Enforcing Transactional Integrity)
const updateGrievanceStatus = async (req, res) => {
  const { id } = req.params; // Grievance ID
  const { status, notes } = req.body; // New status: In_Progress, Resolved

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // A. Verify that this official is indeed actively assigned to this grievance
    const [assignment] = await connection.query(
      'SELECT id FROM grievance_assignments WHERE grievance_id = ? AND official_id = ? AND status = "Active" LIMIT 1',
      [id, req.user.id]
    );

    if (assignment.length === 0) {
      return res.status(403).json({ message: 'Unauthorized: You are not actively assigned to this complaint.' });
    }

    // B. Update the grievance status
    await connection.query(
      'UPDATE grievances SET status = ? WHERE id = ?',
      [status, id]
    );

    // C. If the status is resolved, finalize the assignment record
    if (status === 'Resolved') {
      await connection.query(
        'UPDATE grievance_assignments SET resolved_at = NOW(), status = "Completed" WHERE grievance_id = ? AND official_id = ? AND status = "Active"',
        [id, req.user.id]
      );
    }

    // Note: The trg_after_grievance_update trigger AUTOMATICALLY handles logging the history transition!

    await connection.commit();
    res.json({ message: `Grievance status updated to ${status} successfully.` });
  } catch (err) {
    await connection.rollback();
    console.error('Update Status Error:', err);
    res.status(500).json({ message: 'Failed to update status', error: err.message });
  } finally {
    connection.release();
  }
};

// 6. Escalate Grievance (SLA Timeout or Citizen Action)
const escalateGrievance = async (req, res) => {
  const { id } = req.params;

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // A. Fetch current grievance details
    const [grievances] = await connection.query(
      'SELECT id, current_jurisdiction_id, department_id, status FROM grievances WHERE id = ? LIMIT 1',
      [id]
    );

    if (grievances.length === 0) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const grievance = grievances[0];

    // B. Get parent jurisdiction
    const [jurisdictions] = await connection.query(
      'SELECT parent_id FROM jurisdictions WHERE id = ? LIMIT 1',
      [grievance.current_jurisdiction_id]
    );

    if (jurisdictions.length === 0 || !jurisdictions[0].parent_id) {
      return res.status(400).json({ message: 'This grievance cannot be escalated further (reaches root boundary).' });
    }

    const parentJurisdictionId = jurisdictions[0].parent_id;

    // C. Locate the superior official in the parent jurisdiction
    // Try to find department-specific official first. If none, find general tier officer (e.g. MLA/MP)
    let [superiorOfficials] = await connection.query(
      'SELECT id FROM officials WHERE jurisdiction_id = ? AND department_id = ? LIMIT 1',
      [parentJurisdictionId, grievance.department_id]
    );

    if (superiorOfficials.length === 0) {
      // Fallback to a general representative (officers with NULL department e.g. District Commissioner, MLA)
      [superiorOfficials] = await connection.query(
        'SELECT id FROM officials WHERE jurisdiction_id = ? AND department_id IS NULL LIMIT 1',
        [parentJurisdictionId]
      );
    }

    if (superiorOfficials.length === 0) {
      // Ultimate Fallback: MLA/MP (Jurisdiction ID = 2 or 3)
      [superiorOfficials] = await connection.query(
        'SELECT id FROM officials WHERE designation LIKE "%MLA%" OR designation LIKE "%DC%" LIMIT 1'
      );
    }

    const newOfficialId = superiorOfficials[0].id;

    // D. Mark previous active assignments as Reassigned
    await connection.query(
      'UPDATE grievance_assignments SET status = "Reassigned" WHERE grievance_id = ? AND status = "Active"',
      [id]
    );

    // E. Insert new active assignment to the superior official
    await connection.query(
      'INSERT INTO grievance_assignments (grievance_id, official_id, status) VALUES (?, ?, "Active")',
      [id, newOfficialId]
    );

    // F. Log the escalation details
    await connection.query(
      `INSERT INTO grievance_escalations (grievance_id, escalated_from_jurisdiction_id, escalated_to_jurisdiction_id, trigger_type)
       VALUES (?, ?, ?, ?)`,
      [id, grievance.current_jurisdiction_id, parentJurisdictionId, 'user_approved']
    );

    // G. Update current jurisdiction and status on the grievance itself
    await connection.query(
      'UPDATE grievances SET current_jurisdiction_id = ?, status = "Escalated" WHERE id = ?',
      [parentJurisdictionId, id]
    );

    await connection.commit();
    res.json({ 
      message: 'Grievance escalated successfully to hierarchical superior.',
      escalatedToJurisdictionId: parentJurisdictionId
    });
  } catch (err) {
    await connection.rollback();
    console.error('Escalation Error:', err);
    res.status(500).json({ message: 'Escalation execution failed', error: err.message });
  } finally {
    connection.release();
  }
};

// 7. Submit Citizen Feedback (Multi-criteria Rating)
const submitFeedback = async (req, res) => {
  const { grievance_id, rating_speed, rating_quality, rating_communication, comment } = req.body;

  if (!grievance_id || !rating_speed || !rating_quality || !rating_communication) {
    return res.status(400).json({ message: 'Grievance ID and all three ratings (1-5) are required.' });
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // A. Verify grievance is resolved and belongs to this user
    const [grievances] = await connection.query(
      'SELECT id, status, citizen_id FROM grievances WHERE id = ? LIMIT 1',
      [grievance_id]
    );

    if (grievances.length === 0) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    const grievance = grievances[0];

    if (grievance.citizen_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You did not report this issue.' });
    }

    if (grievance.status !== 'Resolved') {
      return res.status(400).json({ message: 'You can only rate complaints that have been fully Resolved.' });
    }

    // B. Find the official who successfully resolved this complaint (last completed assignment)
    const [assignments] = await connection.query(
      'SELECT official_id FROM grievance_assignments WHERE grievance_id = ? AND status = "Completed" ORDER BY resolved_at DESC LIMIT 1',
      [grievance_id]
    );

    if (assignments.length === 0) {
      return res.status(400).json({ message: 'Could not resolve official assignment details.' });
    }

    const officialId = assignments[0].official_id;

    // C. Write review record
    await connection.query(
      `INSERT INTO feedback_ratings (grievance_id, official_id, rating_speed, rating_quality, rating_communication, comment)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [grievance_id, officialId, rating_speed, rating_quality, rating_communication, comment || null]
    );

    await connection.commit();
    res.status(201).json({ message: 'Thank you! Your feedback has been logged.' });
  } catch (err) {
    await connection.rollback();
    console.error('Feedback Submission Error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'You have already submitted feedback for this grievance.' });
    }
    res.status(500).json({ message: 'Failed to record feedback.', error: err.message });
  } finally {
    connection.release();
  }
};

// 8. Public Official Performance Leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const [leaderboard] = await db.query(`
      SELECT 
          o.id AS official_id,
          o.name AS official_name,
          o.designation AS designation,
          j.name AS jurisdiction_name,
          COUNT(fr.id) AS total_cases_rated,
          ROUND(AVG(fr.rating_speed), 1) AS avg_speed_score,
          ROUND(AVG(fr.rating_quality), 1) AS avg_quality_score,
          ROUND(AVG(fr.rating_communication), 1) AS avg_communication_score,
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
      ORDER BY composite_rating DESC
    `);

    res.json(leaderboard);
  } catch (err) {
    console.error('Leaderboard Fetch Error:', err);
    res.status(500).json({ message: 'Failed to aggregate official rankings', error: err.message });
  }
};

// 9. Fetch static departments list for complaint forms
const getDepartments = async (req, res) => {
  try {
    const [departments] = await db.query('SELECT id, name, SLA_days FROM departments ORDER BY name ASC');
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

// 10. Toggle Upvote on a Grievance
const toggleUpvote = async (req, res) => {
  const grievance_id = req.params.id;
  const user_id = req.user.id;

  try {
    const [existing] = await db.query(
      'SELECT id FROM grievance_upvotes WHERE grievance_id = ? AND user_id = ? LIMIT 1',
      [grievance_id, user_id]
    );

    if (existing.length > 0) {
      await db.query(
        'DELETE FROM grievance_upvotes WHERE grievance_id = ? AND user_id = ?',
        [grievance_id, user_id]
      );
      res.json({ upvoted: false, message: 'Upvote removed successfully.' });
    } else {
      await db.query(
        'INSERT INTO grievance_upvotes (grievance_id, user_id) VALUES (?, ?)',
        [grievance_id, user_id]
      );
      res.json({ upvoted: true, message: 'Upvote recorded successfully!' });
    }
  } catch (err) {
    console.error('Upvote Error:', err);
    res.status(500).json({ message: 'Failed to record upvote', error: err.message });
  }
};

// 11. Fetch Popular Grievances by Location (closest first if coords provided, else upvote count)
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'publicecho_super_secure_jwt_secret_key_987654321';

function parseTokenUserId(authHeader) {
  try {
    if (!authHeader) return null;
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.id;
  } catch (err) {
    return null;
  }
}

const getPopularGrievances = async (req, res) => {
  const { lat, lng } = req.query;
  const user_id = parseTokenUserId(req.headers.authorization);

  try {
    let selectClause = `
      SELECT g.*, d.name AS department_name, j.name AS jurisdiction_name,
             COUNT(gu.id) AS upvote_count,
             COALESCE(MAX(CASE WHEN gu.user_id = ? THEN 1 ELSE 0 END), 0) AS user_has_upvoted
    `;
    let queryParams = [user_id || 0];

    if (lat && lng) {
      selectClause += `, (111.12 * SQRT(POWER(g.latitude - ?, 2) + POWER(g.longitude - ?, 2))) AS distance `;
      queryParams.push(parseFloat(lat), parseFloat(lng));
    }

    let query = `
      ${selectClause}
      FROM grievances g
      INNER JOIN departments d ON g.department_id = d.id
      INNER JOIN jurisdictions j ON g.current_jurisdiction_id = j.id
      LEFT JOIN grievance_upvotes gu ON g.id = gu.grievance_id
      WHERE g.status != 'Resolved'
      GROUP BY g.id, d.name, j.name
    `;

    if (lat && lng) {
      query += ` ORDER BY distance ASC, upvote_count DESC `;
    } else {
      query += ` ORDER BY upvote_count DESC, g.created_at DESC `;
    }

    const [rows] = await db.query(query, queryParams);
    res.json(rows);
  } catch (err) {
    console.error('Fetch Popular Error:', err);
    res.status(500).json({ message: 'Failed to retrieve popular grievances', error: err.message });
  }
};

// 12. Check for Duplicate Grievances Nearby
const checkDuplicateGrievance = async (req, res) => {
  const { latitude, longitude, department_id } = req.query;

  if (!latitude || !longitude || !department_id) {
    return res.status(400).json({ message: 'Latitude, longitude, and department_id are required.' });
  }

  try {
    const [rows] = await db.query(
      `SELECT g.*, d.name AS department_name,
              (111.12 * SQRT(POWER(g.latitude - ?, 2) + POWER(g.longitude - ?, 2))) AS distance
       FROM grievances g
       INNER JOIN departments d ON g.department_id = d.id
       WHERE g.department_id = ? AND g.status != 'Resolved'
       HAVING distance < 0.5
       ORDER BY distance ASC
       LIMIT 3`,
      [parseFloat(latitude), parseFloat(longitude), parseInt(department_id)]
    );

    res.json(rows);
  } catch (err) {
    console.error('Check Duplicate Error:', err);
    res.status(500).json({ message: 'Failed to check duplicates', error: err.message });
  }
};

module.exports = {
  createGrievance,
  getCitizenDashboard,
  getOfficialDashboard,
  getGrievanceTimeline,
  updateGrievanceStatus,
  escalateGrievance,
  submitFeedback,
  getLeaderboard,
  getDepartments,
  toggleUpvote,
  getPopularGrievances,
  checkDuplicateGrievance
};
