const express = require('express');
const router = express.Router();
const { getAuthUrl, handleCallback } = require('../controllers/calendarController');
const { protect } = require('../middleware/authMiddleware');

router.get('/auth', protect, getAuthUrl);
router.get('/callback', handleCallback);

module.exports = router;
