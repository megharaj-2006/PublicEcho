const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/grievanceController');
const { authenticateToken, requireCitizen, requireOfficial } = require('../middleware/auth');

// Public endpoints
router.get('/departments', getDepartments);
router.get('/leaderboard', getLeaderboard);
router.get('/public/popular', getPopularGrievances);
router.get('/check-duplicates', checkDuplicateGrievance);

// Protected endpoints
router.post('/', authenticateToken, requireCitizen, createGrievance);
router.get('/citizen', authenticateToken, requireCitizen, getCitizenDashboard);
router.get('/official', authenticateToken, requireOfficial, getOfficialDashboard);
router.get('/:id/timeline', authenticateToken, getGrievanceTimeline);
router.put('/:id/status', authenticateToken, requireOfficial, updateGrievanceStatus);
router.post('/:id/escalate', authenticateToken, requireCitizen, escalateGrievance);
router.post('/feedback', authenticateToken, requireCitizen, submitFeedback);
router.post('/:id/upvote', authenticateToken, requireCitizen, toggleUpvote);

module.exports = router;
