const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const { getStats, getUsers, getBookings, updateUserRole, updateBookingStatus } = require('../controllers/adminController');

// All admin routes require admin authentication
router.use(adminAuth);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/bookings', getBookings);
router.patch('/users/:id/role', updateUserRole);
router.patch('/bookings/:id/status', updateBookingStatus);

module.exports = router;
