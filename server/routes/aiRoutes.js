const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// POST /api/ai/analyze — generate AI justification for a match
router.post('/analyze', aiController.analyzeMatch);

module.exports = router;
