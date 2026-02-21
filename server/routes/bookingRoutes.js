const express = require('express');
const router = express.Router();
const { createBooking, getBookingsByUser, updateBookingStatus, rescheduleBooking } = require('../controllers/bookingController');
const { downloadIcs } = require('../controllers/calendarController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/', protect, getBookingsByUser);
router.patch('/:id/status', protect, updateBookingStatus);
router.patch('/:id/reschedule', protect, rescheduleBooking);
router.get('/:id/calendar', protect, downloadIcs);

module.exports = router;
