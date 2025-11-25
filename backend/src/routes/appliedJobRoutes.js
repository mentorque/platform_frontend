const express = require('express');
const router = express.Router();
const { 
  getAppliedJobs, 
  createAppliedJob, 
  updateJobStatus, 
  deleteAppliedJob,
  getDailyGoal,
  updateDailyGoal
} = require('../controllers/appliedJobs');
const { verifyFirebaseToken } = require('../utils/firebaseAdmin');

// All routes require authentication
router.use(verifyFirebaseToken);

// GET /api/applied-jobs - Get all applied jobs for user
router.get('/applied-jobs', getAppliedJobs);

// POST /api/applied-jobs - Create new applied job
router.post('/applied-jobs', createAppliedJob);

// PATCH /api/applied-jobs/:jobId/status - Update job status
router.patch('/applied-jobs/:jobId/status', updateJobStatus);

// DELETE /api/applied-jobs/:jobId - Delete applied job
router.delete('/applied-jobs/:jobId', deleteAppliedJob);

// GET /api/applied-jobs/goal - Get daily goal
router.get('/applied-jobs/goal', getDailyGoal);

// PATCH /api/applied-jobs/goal - Update daily goal
router.patch('/applied-jobs/goal', updateDailyGoal);

module.exports = router;

