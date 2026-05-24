const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'publicecho_super_secure_jwt_secret_key_987654321';

// 1. Citizen Registration
const registerCitizen = async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if email already exists in users or officials
    const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    const [existingOfficials] = await db.query('SELECT id FROM officials WHERE email = ?', [email]);

    if (existingUsers.length > 0 || existingOfficials.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, passwordHash, phone, 'citizen']
    );

    const userId = result.insertId;

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, name, email, role: 'citizen' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Citizen registered successfully',
      token,
      user: { id: userId, name, email, role: 'citizen' }
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ message: 'Server error during registration', error: err.message });
  }
};

// 2. Citizen Login
const loginCitizen = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
};

// Helper to parse domain
const getEmailDomain = (email) => {
  const parts = email.split('@');
  return parts.length > 1 ? parts[1] : '';
};

// In-memory OTP code cache for Multi-Factor Authentication
// Keys: email, Values: { code, official }
const otpCache = new Map();

// 3. Upgraded Official Login (With OTP & Domain Checks & Approval Status validation)
const loginOfficial = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Validate domain prefix
    const domain = getEmailDomain(email);
    const [matchingDomains] = await db.query('SELECT id FROM official_domains WHERE domain_name = ?', [domain]);

    if (matchingDomains.length === 0) {
      return res.status(400).json({ message: 'Authentication Denied: Provided email domain is not a valid official ID.' });
    }

    const [officials] = await db.query(
      `SELECT o.*, j.name AS jurisdiction_name, j.tier AS jurisdiction_tier, d.name AS department_name 
       FROM officials o
       INNER JOIN jurisdictions j ON o.jurisdiction_id = j.id
       LEFT JOIN departments d ON o.department_id = d.id
       WHERE o.email = ?`,
      [email]
    );

    if (officials.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const official = officials[0];
    const isMatch = await bcrypt.compare(password, official.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check account status
    if (official.status === 'Pending') {
      return res.status(403).json({ message: 'Login Denied: Your registration is currently awaiting Admin approval.' });
    }
    if (official.status === 'Rejected') {
      return res.status(403).json({ message: 'Login Denied: Your registration request was rejected by the system Admin.' });
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    otpCache.set(email, { code, official });

    res.status(200).json({
      otpRequired: true,
      email,
      simulatedCode: code, // Shared in response so client can display it as simulated email
      message: 'MFA Code generated successfully.'
    });
  } catch (err) {
    console.error('Official Login Error:', err);
    res.status(500).json({ message: 'Server error during official login', error: err.message });
  }
};

// 3.1 Verify Official OTP Code
const verifyOfficialOTP = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: 'Email and verification code are required.' });
  }

  const cached = otpCache.get(email);
  if (!cached || cached.code !== code.trim()) {
    return res.status(400).json({ message: 'Invalid or expired verification code.' });
  }

  const official = cached.official;
  otpCache.delete(email); // Clear cache

  // Generate final JWT token
  const token = jwt.sign(
    { 
      id: official.id, 
      name: official.name, 
      email: official.email, 
      role: 'official',
      designation: official.designation,
      jurisdiction_id: official.jurisdiction_id,
      jurisdiction_name: official.jurisdiction_name,
      jurisdiction_tier: official.jurisdiction_tier,
      department_id: official.department_id,
      department_name: official.department_name
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.status(200).json({
    message: 'Verification complete. Access granted.',
    token,
    user: { 
      id: official.id, 
      name: official.name, 
      email: official.email, 
      role: 'official',
      designation: official.designation,
      jurisdiction_id: official.jurisdiction_id,
      jurisdiction_name: official.jurisdiction_name,
      jurisdiction_tier: official.jurisdiction_tier,
      department_id: official.department_id,
      department_name: official.department_name
    }
  });
};

// 3.2 Register a New Official (Requires proofs & domain check)
const registerOfficial = async (req, res) => {
  const { name, email, password, jurisdiction_id, department_id, designation, office_id_proof, photo_proof } = req.body;

  if (!name || !email || !password || !jurisdiction_id || !designation || !office_id_proof || !photo_proof) {
    return res.status(400).json({ message: 'All fields including ID proof and self photo are mandatory.' });
  }

  try {
    // Validate domain
    const domain = getEmailDomain(email);
    const [matchingDomains] = await db.query('SELECT id FROM official_domains WHERE domain_name = ?', [domain]);

    if (matchingDomains.length === 0) {
      return res.status(400).json({ message: 'Registration Denied: The provided email domain is not a valid official ID.' });
    }

    // Check existing
    const [existingOfficials] = await db.query('SELECT id FROM officials WHERE email = ?', [email]);
    const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);

    if (existingOfficials.length > 0 || existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email address already registered.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Save as Pending
    await db.query(
      `INSERT INTO officials (name, email, password_hash, jurisdiction_id, department_id, designation, status, office_id_proof, photo_proof)
       VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?, ?)`,
      [name, email, passwordHash, jurisdiction_id, department_id || null, designation, office_id_proof, photo_proof]
    );

    res.status(201).json({
      message: 'Official registration submitted successfully. Awaiting Admin verification.'
    });
  } catch (err) {
    console.error('Official Register Error:', err);
    res.status(500).json({ message: 'Server error during official registration', error: err.message });
  }
};

// 4. Get Current Profile
const getProfile = async (req, res) => {
  try {
    if (req.user.role === 'citizen' || req.user.role === 'admin') {
      const [users] = await db.query('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?', [req.user.id]);
      if (users.length === 0) return res.status(404).json({ message: 'User not found' });
      return res.json(users[0]);
    } else if (req.user.role === 'official') {
      const [officials] = await db.query(
        `SELECT o.id, o.name, o.email, o.designation, o.created_at,
                j.name AS jurisdiction_name, j.tier AS jurisdiction_tier,
                d.name AS department_name
         FROM officials o
         INNER JOIN jurisdictions j ON o.jurisdiction_id = j.id
         LEFT JOIN departments d ON o.department_id = d.id
         WHERE o.id = ?`,
        [req.user.id]
      );
      if (officials.length === 0) return res.status(404).json({ message: 'Official not found' });
      return res.json({ ...officials[0], role: 'official' });
    }
    res.status(400).json({ message: 'Invalid role' });
  } catch (err) {
    console.error('Profile Fetch Error:', err);
    res.status(500).json({ message: 'Server error fetching profile', error: err.message });
  }
};

// 5. Google Login (Autonomic registration if new)
const loginGoogle = async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ message: 'Email and Name are required for Google Auth.' });
  }

  try {
    let [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    let user;

    if (users.length === 0) {
      const dummyPassword = await bcrypt.hash(Math.random().toString(36), 10);
      const [result] = await db.query(
        'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, dummyPassword, 'Google Linked', 'citizen']
      );
      
      const newUserId = result.insertId;
      user = { id: newUserId, name, email, role: 'citizen' };
    } else {
      user = users[0];
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Google login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(500).json({ message: 'Server error during Google Auth', error: err.message });
  }
};

// 6. Admin Portal: Fetch Pending Registrations
const getPendingOfficials = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access only.' });
  }

  try {
    const [pendings] = await db.query(
      `SELECT o.id, o.name, o.email, o.designation, o.created_at,
              o.office_id_proof, o.photo_proof,
              j.name AS jurisdiction_name, j.tier AS jurisdiction_tier,
              d.name AS department_name
       FROM officials o
       INNER JOIN jurisdictions j ON o.jurisdiction_id = j.id
       LEFT JOIN departments d ON o.department_id = d.id
       WHERE o.status = 'Pending'
       ORDER BY o.created_at ASC`
    );
    res.json(pendings);
  } catch (err) {
    console.error('Fetch Pending Error:', err);
    res.status(500).json({ message: 'Failed to retrieve registrations', error: err.message });
  }
};

// 7. Admin Portal: Approve Official Request
const approveOfficial = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access only.' });
  }

  const { id } = req.params;

  try {
    await db.query('UPDATE officials SET status = "Approved" WHERE id = ?', [id]);
    res.json({ message: 'Official registration request approved successfully.' });
  } catch (err) {
    console.error('Approve Error:', err);
    res.status(500).json({ message: 'Failed to approve official', error: err.message });
  }
};

// 8. Admin Portal: Reject Official Request
const rejectOfficial = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access only.' });
  }

  const { id } = req.params;

  try {
    await db.query('UPDATE officials SET status = "Rejected" WHERE id = ?', [id]);
    res.json({ message: 'Official registration request rejected.' });
  } catch (err) {
    console.error('Reject Error:', err);
    res.status(500).json({ message: 'Failed to reject official', error: err.message });
  }
};

module.exports = {
  registerCitizen,
  loginCitizen,
  loginOfficial,
  getProfile,
  loginGoogle,
  registerOfficial,
  verifyOfficialOTP,
  getPendingOfficials,
  approveOfficial,
  rejectOfficial
};
