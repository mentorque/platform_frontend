const express = require('express');
const router = express.Router();
const { getUserProgress, updateWeekDone, updateWeekNotes } = require('../controllers/progress');

// GET /progress/ - Get user's progress
router.get('/', getUserProgress);

// PUT /progress/week/:index/done - Update week completion status
router.put('/week/:index/done', updateWeekDone);

// PUT /progress/week/:index/notes - Update week notes
router.put('/week/:index/notes', updateWeekNotes);

module.exports = router;
