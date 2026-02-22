const express = require('express');
const router = express.Router();
const { getExperts, getExpertById, updateExpertAvailability } = require('../controllers/expertController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getExperts);
router.get('/:id', getExpertById);
router.put('/availability', protect, updateExpertAvailability);

module.exports = router;
