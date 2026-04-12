const express = require('express');
const router = express.Router();
const { generateNotes, getNotes } = require('../controllers/sessionNotesController');

router.post('/:bookingId/notes', generateNotes);
router.get('/:bookingId/notes', getNotes);

module.exports = router;
