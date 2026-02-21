const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateUserProfile, updateUserPassword, becomeExpert } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateUserProfile);
router.put('/password', protect, updateUserPassword);
router.post('/become-expert', protect, becomeExpert);

module.exports = router;
