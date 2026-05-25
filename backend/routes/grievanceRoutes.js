const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/grievanceController');
const { authenticateToken, requireCitizen, requireOfficial } = require('../middleware/auth');

// Public endpoints
router.get('/departments', getDepartments);
router.get('/wards', getWards);
router.get('/public/popular', getPopularGrievances);
router.get('/check-duplicates', checkDuplicateGrievance);
router.get('/leaderboard', getLeaderboard);

// Protected endpoints
router.post('/', authenticateToken, requireCitizen, createGrievance);
router.get('/citizen', authenticateToken, requireCitizen, getCitizenDashboard);
router.get('/official', authenticateToken, requireOfficial, getOfficialDashboard);
router.get('/:id/timeline', authenticateToken, getGrievanceTimeline);
router.post('/:id/upvote', authenticateToken, requireCitizen, toggleUpvote);

// Official Focus Actions
router.post('/:id/accept', authenticateToken, requireOfficial, acceptComplaint);
router.post('/:id/reject', authenticateToken, requireOfficial, rejectComplaint);
router.post('/:id/update', authenticateToken, requireOfficial, postComplaintUpdate);
router.post('/:id/resolve', authenticateToken, requireOfficial, resolveComplaint);

module.exports = router;
