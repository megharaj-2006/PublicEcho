const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', registerCitizen);
router.post('/login', loginCitizen);
router.post('/official/login', loginOfficial);
router.post('/official/register', registerOfficial);
router.post('/official/verify-otp', verifyOfficialOTP);
router.post('/google/login', loginGoogle);
router.get('/profile', authenticateToken, getProfile);

// Admin Approval Routes
router.get('/admin/pending', authenticateToken, getPendingOfficials);
router.put('/admin/approve/:id', authenticateToken, approveOfficial);
router.put('/admin/reject/:id', authenticateToken, rejectOfficial);

module.exports = router;
