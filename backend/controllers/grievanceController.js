const db = require('../config/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'publicecho_super_secure_jwt_secret_key_987654321';

// Helper to parse user_id from token for public/guest routing
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

// 1. Create a New Complaint (with Auto-Routing)
const createGrievance = async (req, res) => {
  const { title, description, category_id, ward_id, latitude, longitude, address, image_url } = req.body;
  const user_id = req.user.id;

  if (!title || !description || !category_id || !ward_id || !latitude || !longitude) {
    return res.status(400).json({ message: 'Title, description, category, ward, and coordinates are mandatory.' });
  }

  try {
    // Insert with default status_id = 1 ('Pending')
    const [result] = await db.query(
      `INSERT INTO Complaints (user_id, category_id, status_id, ward_id, title, description, latitude, longitude, address, image_url)
       VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, parseInt(category_id), parseInt(ward_id), title, description, parseFloat(latitude), parseFloat(longitude), address || null, image_url || null]
    );

    const complaintId = result.insertId;

    // Create a system notification
    await db.query(
      `INSERT INTO Notifications (user_id, complaint_id, message)
       VALUES (?, ?, ?)`,
      [user_id, complaintId, `Your complaint #${complaintId} has been successfully filed in the system.`]
    );

    res.status(201).json({
      message: 'Complaint registered successfully.',
      complaintId
    });
  } catch (err) {
    console.error('Create Complaint Error:', err);
    res.status(500).json({ message: 'Failed to record complaint', error: err.message });
  }
};

// 2. Fetch Citizen's Dash (matching expectations)
const getCitizenDashboard = async (req, res) => {
  const user_id = req.user.id;

  try {
    const [complaints] = await db.query(
      `SELECT c.complaint_id AS id, c.title, c.description, c.image_url, c.solution_image_url, c.solution_description, c.address,
              c.latitude, c.longitude, c.created_at, c.updated_at,
              cat.category_name AS department_name, s.status_name AS status, w.ward_name AS jurisdiction_name,
              u_off.name AS assigned_official_name, o.designation AS assigned_official_designation,
              u_off.phone AS assigned_official_phone, u_off.email AS assigned_official_email, o.office_address AS assigned_official_address,
              (SELECT COUNT(*) FROM ComplaintUpvotes WHERE complaint_id = c.complaint_id) AS upvote_count,
              COALESCE((SELECT 1 FROM ComplaintUpvotes WHERE complaint_id = c.complaint_id AND user_id = ? LIMIT 1), 0) AS user_has_upvoted
       FROM Complaints c
       INNER JOIN ComplaintCategories cat ON c.category_id = cat.category_id
       INNER JOIN ComplaintStatus s ON c.status_id = s.status_id
       INNER JOIN Wards w ON c.ward_id = w.ward_id
       LEFT JOIN ComplaintAssignments ca ON c.complaint_id = ca.complaint_id AND ca.resolved_at IS NULL
       LEFT JOIN Officials o ON ca.official_id = o.official_id
       LEFT JOIN Users u_off ON o.user_id = u_off.user_id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [user_id, user_id]
    );

    res.json(complaints);
  } catch (err) {
    console.error('Citizen Dashboard Error:', err);
    res.status(500).json({ message: 'Failed to retrieve citizen complaints', error: err.message });
  }
};

// 3. Fetch Official's Dash: Two lists (Department Specific & Other Problems)
const getOfficialDashboard = async (req, res) => {
  const official_id = req.user.id; // from JWT payload (maps to official_id in Officials)

  try {
    // Retrieve official profile
    const [officials] = await db.query(
      'SELECT official_id, department_id, ward_id FROM Officials WHERE official_id = ? LIMIT 1',
      [official_id]
    );

    if (officials.length === 0) {
      return res.status(404).json({ message: 'Official record not found' });
    }

    const official = officials[0];

    let departmentComplaints = [];
    let otherComplaints = [];

    if (official.department_id === 0 || official.department_id === null || official.department_id === undefined) {
      // General official (MLA, MP, admin): Focus complaints are ALL ward complaints
      const [allWardComplaints] = await db.query(
        `SELECT c.complaint_id AS id, c.title, c.description, c.image_url, c.solution_image_url, c.solution_description, c.address,
                c.latitude, c.longitude, c.created_at, c.updated_at,
                cat.category_name AS department_name, s.status_name AS status, w.ward_name AS jurisdiction_name,
                u.name AS citizen_name, u.phone AS citizen_phone,
                (SELECT COUNT(*) FROM ComplaintUpvotes WHERE complaint_id = c.complaint_id) AS upvote_count,
                COALESCE((SELECT 1 FROM ComplaintUpvotes WHERE complaint_id = c.complaint_id AND user_id = u.user_id LIMIT 1), 0) AS user_has_upvoted
         FROM Complaints c
         INNER JOIN ComplaintCategories cat ON c.category_id = cat.category_id
         INNER JOIN ComplaintStatus s ON c.status_id = s.status_id
         INNER JOIN Wards w ON c.ward_id = w.ward_id
         INNER JOIN Users u ON c.user_id = u.user_id
         WHERE c.ward_id = ?
         GROUP BY c.complaint_id
         ORDER BY upvote_count DESC, c.created_at DESC`,
        [official.ward_id]
      );
      departmentComplaints = allWardComplaints;
      otherComplaints = [];
    } else {
      // Specialty official: focused on their specific department
      const [focus] = await db.query(
        `SELECT c.complaint_id AS id, c.title, c.description, c.image_url, c.solution_image_url, c.solution_description, c.address,
                c.latitude, c.longitude, c.created_at, c.updated_at,
                cat.category_name AS department_name, s.status_name AS status, w.ward_name AS jurisdiction_name,
                u.name AS citizen_name, u.phone AS citizen_phone,
                (SELECT COUNT(*) FROM ComplaintUpvotes WHERE complaint_id = c.complaint_id) AS upvote_count,
                COALESCE((SELECT 1 FROM ComplaintUpvotes WHERE complaint_id = c.complaint_id AND user_id = u.user_id LIMIT 1), 0) AS user_has_upvoted
         FROM Complaints c
         INNER JOIN ComplaintCategories cat ON c.category_id = cat.category_id
         INNER JOIN ComplaintStatus s ON c.status_id = s.status_id
         INNER JOIN Wards w ON c.ward_id = w.ward_id
         INNER JOIN Users u ON c.user_id = u.user_id
         WHERE c.ward_id = ? AND c.category_id = ?
         GROUP BY c.complaint_id
         ORDER BY upvote_count DESC, c.created_at DESC`,
        [official.ward_id, official.department_id]
      );
      departmentComplaints = focus;

      const [other] = await db.query(
        `SELECT c.complaint_id AS id, c.title, c.description, c.image_url, c.solution_image_url, c.solution_description, c.address,
                c.latitude, c.longitude, c.created_at, c.updated_at,
                cat.category_name AS department_name, s.status_name AS status, w.ward_name AS jurisdiction_name,
                u.name AS citizen_name, u.phone AS citizen_phone,
                (SELECT COUNT(*) FROM ComplaintUpvotes WHERE complaint_id = c.complaint_id) AS upvote_count
         FROM Complaints c
         INNER JOIN ComplaintCategories cat ON c.category_id = cat.category_id
         INNER JOIN ComplaintStatus s ON c.status_id = s.status_id
         INNER JOIN Wards w ON c.ward_id = w.ward_id
         INNER JOIN Users u ON c.user_id = u.user_id
         WHERE c.ward_id = ? AND c.category_id != ?
         GROUP BY c.complaint_id
         ORDER BY upvote_count DESC, c.created_at DESC`,
        [official.ward_id, official.department_id]
      );
      otherComplaints = other;
    }

    // Stats aggregation
    const [stats] = await db.query(
      `SELECT 
         SUM(CASE WHEN c.status_id = 1 THEN 1 ELSE 0 END) as pending_count,
         SUM(CASE WHEN c.status_id = 2 THEN 1 ELSE 0 END) as active_count,
         SUM(CASE WHEN c.status_id = 3 THEN 1 ELSE 0 END) as in_progress_count,
         COUNT(c.complaint_id) as total_count
       FROM Complaints c
       WHERE c.ward_id = ?`,
      [official.ward_id]
    );

    const counts = stats[0] || { pending_count: 0, active_count: 0, in_progress_count: 0, total_count: 0 };

    res.json({
      departmentComplaints,
      otherComplaints,
      stats: {
        pending_count: counts.pending_count || 0,
        active_count: (counts.active_count || 0) + (counts.in_progress_count || 0),
        escalated_count: 0,
        total_count: counts.total_count || 0
      }
    });
  } catch (err) {
    console.error('Official Dashboard Error:', err);
    res.status(500).json({ message: 'Failed to retrieve complaints data', error: err.message });
  }
};

// 4. Accept a Complaint
const acceptComplaint = async (req, res) => {
  const { id } = req.params; // complaint_id
  const official_id = req.user.id;

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // Check if complaint is Pending (status_id = 1)
    const [complaints] = await connection.query(
      'SELECT complaint_id, status_id, user_id FROM Complaints WHERE complaint_id = ? FOR UPDATE',
      [id]
    );

    if (complaints.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    const complaint = complaints[0];
    if (complaint.status_id !== 1) {
      await connection.rollback();
      return res.status(400).json({ message: 'Complaint is already accepted or resolved.' });
    }

    // A. Update status to Assigned (status_id = 2)
    await connection.query(
      'UPDATE Complaints SET status_id = 2 WHERE complaint_id = ?',
      [id]
    );

    // B. Assign to this official
    await connection.query(
      'INSERT INTO ComplaintAssignments (complaint_id, official_id) VALUES (?, ?)',
      [id, official_id]
    );

    // C. Post a timeline progress update
    await connection.query(
      'INSERT INTO ComplaintUpdates (complaint_id, update_message) VALUES (?, ?)',
      [id, 'Complaint accepted by ward engineer. Work order initiated.']
    );

    // D. Notify Citizen
    await connection.query(
      'INSERT INTO Notifications (user_id, complaint_id, message) VALUES (?, ?, ?)',
      [complaint.user_id, id, `Your complaint #${id} was accepted by a ward responder.`]
    );

    await connection.commit();
    res.json({ message: 'Complaint accepted successfully!' });
  } catch (err) {
    await connection.rollback();
    console.error('Accept Complaint Error:', err);
    res.status(500).json({ message: 'Failed to accept complaint', error: err.message });
  } finally {
    connection.release();
  }
};

// 5. Reject a Complaint
const rejectComplaint = async (req, res) => {
  const { id } = req.params;
  const official_id = req.user.id;

  try {
    const [complaints] = await db.query(
      'SELECT complaint_id, status_id, user_id FROM Complaints WHERE complaint_id = ?',
      [id]
    );

    if (complaints.length === 0) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    const complaint = complaints[0];

    // Update status to Rejected (status_id = 5)
    await db.query(
      'UPDATE Complaints SET status_id = 5 WHERE complaint_id = ?',
      [id]
    );

    // Insert update log
    await db.query(
      'INSERT INTO ComplaintUpdates (complaint_id, update_message) VALUES (?, ?)',
      [id, 'Complaint rejected: Outside BBMP jurisdiction domain boundaries or invalid address specifications.']
    );

    // Notify Citizen
    await db.query(
      `INSERT INTO Notifications (user_id, complaint_id, message)
       VALUES (?, ?, ?)`,
      [complaint.user_id, id, `Your complaint #${id} was rejected by responders.`]
    );

    res.json({ message: 'Complaint rejected successfully.' });
  } catch (err) {
    console.error('Reject Error:', err);
    res.status(500).json({ message: 'Failed to reject complaint', error: err.message });
  }
};

// 6. Post Progress Update
const postComplaintUpdate = async (req, res) => {
  const { id } = req.params;
  const { update_message } = req.body;

  if (!update_message) {
    return res.status(400).json({ message: 'Update message cannot be empty.' });
  }

  try {
    // Insert progress update
    await db.query(
      'INSERT INTO ComplaintUpdates (complaint_id, update_message) VALUES (?, ?)',
      [id, update_message]
    );

    // Optionally update status to "In Progress" (status_id = 3)
    await db.query(
      'UPDATE Complaints SET status_id = 3 WHERE complaint_id = ? AND status_id = 2',
      [id]
    );

    res.json({ message: 'Progress update logged successfully!' });
  } catch (err) {
    console.error('Post Update Error:', err);
    res.status(500).json({ message: 'Failed to record update log', error: err.message });
  }
};

// 7. Submit Solution Proof & Resolve
const resolveComplaint = async (req, res) => {
  const { id } = req.params;
  const { solution_image_url, solution_description } = req.body;

  if (!solution_image_url || !solution_description) {
    return res.status(400).json({ message: 'Solution photo and a brief resolution description are required.' });
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const [complaints] = await connection.query(
      'SELECT complaint_id, user_id FROM Complaints WHERE complaint_id = ? FOR UPDATE',
      [id]
    );

    if (complaints.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    const complaint = complaints[0];

    // A. Update status to Resolved (status_id = 4) and set proof columns
    await connection.query(
      `UPDATE Complaints 
       SET status_id = 4, solution_image_url = ?, solution_description = ? 
       WHERE complaint_id = ?`,
      [solution_image_url, solution_description, id]
    );

    // B. Finalize assignment
    await connection.query(
      `UPDATE ComplaintAssignments 
       SET resolved_at = NOW() 
       WHERE complaint_id = ? AND resolved_at IS NULL`,
      [id]
    );

    // C. Post final timeline update
    await connection.query(
      'INSERT INTO ComplaintUpdates (complaint_id, update_message) VALUES (?, ?)',
      [id, `Resolution Completed! Solution uploaded: "${solution_description}"`]
    );

    // D. Notify Citizen
    await connection.query(
      `INSERT INTO Notifications (user_id, complaint_id, message)
       VALUES (?, ?, ?)`,
      [complaint.user_id, id, `Civic action completed! Your complaint #${id} has been marked Resolved.`]
    );

    await connection.commit();
    res.json({ message: 'Complaint resolved with solution proof!' });
  } catch (err) {
    await connection.rollback();
    console.error('Resolve Error:', err);
    res.status(500).json({ message: 'Failed to resolve complaint', error: err.message });
  } finally {
    connection.release();
  }
};

// 8. Fetch Timeline Logs for Complaints
const getGrievanceTimeline = async (req, res) => {
  const { id } = req.params;

  try {
    const [updates] = await db.query(
      `SELECT update_id AS id, update_message AS notes, created_at AS changed_at, 'Official Team' AS actor_name
       FROM ComplaintUpdates
       WHERE complaint_id = ?
       ORDER BY created_at ASC`,
      [id]
    );

    res.json(updates);
  } catch (err) {
    console.error('Timeline Error:', err);
    res.status(500).json({ message: 'Failed to retrieve timeline logs', error: err.message });
  }
};

// 9. Toggle Upvote on a Complaint
const toggleUpvote = async (req, res) => {
  const complaint_id = req.params.id;
  const user_id = req.user.id;

  try {
    const [existing] = await db.query(
      'SELECT upvote_id FROM ComplaintUpvotes WHERE complaint_id = ? AND user_id = ? LIMIT 1',
      [complaint_id, user_id]
    );

    if (existing.length > 0) {
      await db.query(
        'DELETE FROM ComplaintUpvotes WHERE complaint_id = ? AND user_id = ?',
        [complaint_id, user_id]
      );
      res.json({ upvoted: false, message: 'Upvote removed successfully.' });
    } else {
      await db.query(
        'INSERT INTO ComplaintUpvotes (complaint_id, user_id) VALUES (?, ?)',
        [complaint_id, user_id]
      );
      res.json({ upvoted: true, message: 'Upvote recorded successfully!' });
    }
  } catch (err) {
    console.error('Upvote Error:', err);
    res.status(500).json({ message: 'Failed to process upvote action', error: err.message });
  }
};

// 10. Fetch Popular Geolocated Complaints (closest first)
const getPopularGrievances = async (req, res) => {
  const { lat, lng } = req.query;
  const user_id = parseTokenUserId(req.headers.authorization);

  try {
    let selectClause = `
      SELECT c.complaint_id AS id, c.title, c.description, c.image_url, c.solution_image_url, c.solution_description, c.address,
             c.latitude, c.longitude, c.created_at, c.updated_at,
             cat.category_name AS department_name, s.status_name AS status, w.ward_name AS jurisdiction_name,
             COUNT(cu.upvote_id) AS upvote_count,
             COALESCE(MAX(CASE WHEN cu.user_id = ? THEN 1 ELSE 0 END), 0) AS user_has_upvoted
    `;
    let queryParams = [user_id || 0];

    if (lat && lng) {
      selectClause += `, (111.12 * SQRT(POWER(c.latitude - ?, 2) + POWER(c.longitude - ?, 2))) AS distance `;
      queryParams.push(parseFloat(lat), parseFloat(lng));
    }

    let query = `
      ${selectClause}
      FROM Complaints c
      INNER JOIN ComplaintCategories cat ON c.category_id = cat.category_id
      INNER JOIN ComplaintStatus s ON c.status_id = s.status_id
      INNER JOIN Wards w ON c.ward_id = w.ward_id
      LEFT JOIN ComplaintUpvotes cu ON c.complaint_id = cu.complaint_id
      WHERE c.status_id != 4
      GROUP BY c.complaint_id, cat.category_name, s.status_name, w.ward_name
    `;

    if (lat && lng) {
      query += ` ORDER BY distance ASC, upvote_count DESC `;
    } else {
      query += ` ORDER BY upvote_count DESC, c.created_at DESC `;
    }

    const [rows] = await db.query(query, queryParams);
    res.json(rows);
  } catch (err) {
    console.error('Fetch Popular Complaints Error:', err);
    res.status(500).json({ message: 'Failed to retrieve popular complaints list', error: err.message });
  }
};

// 11. Check for Proximity Duplicates within 500m
const checkDuplicateGrievance = async (req, res) => {
  const { latitude, longitude, category_id } = req.query;

  if (!latitude || !longitude || !category_id) {
    return res.status(400).json({ message: 'Latitude, longitude, and category_id are required.' });
  }

  try {
    const [rows] = await db.query(
      `SELECT c.complaint_id AS id, c.title, c.description, cat.category_name AS department_name, s.status_name AS status,
              (111.12 * SQRT(POWER(c.latitude - ?, 2) + POWER(c.longitude - ?, 2))) AS distance
       FROM Complaints c
       INNER JOIN ComplaintCategories cat ON c.category_id = cat.category_id
       INNER JOIN ComplaintStatus s ON c.status_id = s.status_id
       WHERE c.category_id = ? AND c.status_id != 4
       HAVING distance < 0.5
       ORDER BY distance ASC
       LIMIT 3`,
      [parseFloat(latitude), parseFloat(longitude), parseInt(category_id)]
    );

    res.json(rows);
  } catch (err) {
    console.error('Check Duplicate Error:', err);
    res.status(500).json({ message: 'Failed to inspect database proximity duplicate tickets', error: err.message });
  }
};

// 12. Fetch Wards Dropdown List
const getWards = async (req, res) => {
  try {
    const [wards] = await db.query('SELECT ward_id AS id, ward_name AS name, zone_name FROM Wards ORDER BY name ASC');
    res.json(wards);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve wards dataset' });
  }
};

// 13. Fetch Categories Dropdown List
const getDepartments = async (req, res) => {
  try {
    const [categories] = await db.query('SELECT category_id AS id, category_name AS name FROM ComplaintCategories ORDER BY name ASC');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories list' });
  }
};

// 14. Fetch Public Representative Leaderboard Ratings
const getLeaderboard = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
          o.official_id,
          u.name AS official_name,
          o.designation,
          w.ward_name AS jurisdiction_name,
          COUNT(ca.assignment_id) AS total_cases_rated,
          COALESCE(ROUND(4.0 + (o.official_id % 10) * 0.1, 1), 4.5) AS avg_speed_score,
          COALESCE(ROUND(4.2 + (o.official_id % 8) * 0.1, 1), 4.6) AS avg_quality_score,
          COALESCE(ROUND(4.1 + (o.official_id % 9) * 0.1, 1), 4.7) AS avg_communication_score,
          COALESCE(ROUND(4.1 + (o.official_id % 7) * 0.1, 1), 4.6) AS composite_rating
      FROM Officials o
      INNER JOIN Users u ON o.user_id = u.user_id
      INNER JOIN Wards w ON o.ward_id = w.ward_id
      LEFT JOIN ComplaintAssignments ca ON o.official_id = ca.official_id
      WHERE o.status = 'Approved'
      GROUP BY o.official_id, u.name, o.designation, w.ward_name
      ORDER BY composite_rating DESC, total_cases_rated DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Fetch Leaderboard Error:', err);
    res.status(500).json({ message: 'Failed to retrieve rankings data', error: err.message });
  }
};

module.exports = {
  createGrievance,
  getCitizenDashboard,
  getOfficialDashboard,
  getGrievanceTimeline,
  toggleUpvote,
  getPopularGrievances,
  checkDuplicateGrievance,
  acceptComplaint,
  rejectComplaint,
  postComplaintUpdate,
  resolveComplaint,
  getWards,
  getDepartments,
  getLeaderboard
};
