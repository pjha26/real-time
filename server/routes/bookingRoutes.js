const express = require('express');
const router = express.Router();
const { createBooking, getBookingsByUser, updateBookingStatus } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/', protect, getBookingsByUser);
router.patch('/:id/status', updateBookingStatus);

module.exports = router;
