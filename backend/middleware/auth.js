const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'publicecho_super_secure_jwt_secret_key_987654321';

// Authenticate any logged-in user (citizen or official)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No Token Provided' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Stores id, email, role, jurisdiction_id/department_id if official
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or Expired Token' });
  }
};

// Enforce Citizen role
const requireCitizen = (req, res, next) => {
  if (req.user && req.user.role === 'citizen') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Citizen access required' });
  }
};

// Enforce Official role
const requireOfficial = (req, res, next) => {
  if (req.user && req.user.role === 'official') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Official access required' });
  }
};

module.exports = {
  authenticateToken,
  requireCitizen,
  requireOfficial
};
