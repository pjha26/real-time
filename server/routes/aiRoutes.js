const express = require('express');
const router = express.Router();
const { analyzeMatch, matchExperts } = require('../controllers/aiController');

router.post('/analyze', analyzeMatch);
router.post('/match', matchExperts);

module.exports = router;
