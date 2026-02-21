const express = require('express');
const router = express.Router();
const { getEventTypesByExpert, createEventType, updateEventType, deleteEventType } = require('../controllers/eventTypeController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createEventType);

router.route('/:id')
    .put(protect, updateEventType)
    .delete(protect, deleteEventType);

router.route('/expert/:expertId')
    .get(getEventTypesByExpert);

module.exports = router;
