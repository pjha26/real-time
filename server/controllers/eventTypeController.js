const EventType = require('../models/EventType');
const Expert = require('../models/Expert');

// @desc    Get all event types for an expert
// @route   GET /api/event-types/expert/:expertId
// @access  Public
const getEventTypesByExpert = async (req, res) => {
    try {
        const eventTypes = await EventType.find({ expert: req.params.expertId });
        res.json(eventTypes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Create a new event type
// @route   POST /api/event-types
// @access  Private (Expert only)
const createEventType = async (req, res) => {
    try {
        const { title, duration, location, description, urlSlug } = req.body;

        // Ensure user is an expert. For this MVP, we assume the user's ID matches their expert profile.
        // In a real system, User would have a 'role' or reference to Expert. 
        // Here, we'll try to find an Expert doc where _id or user ref matches.
        // Since our MVP doesn't tightly link User->Expert creation yet, we'll assume the client sends the expertId or relies on a known mapping.
        // Let's assume the client sends expertId in the body for now, but verify it.
        const expertId = req.body.expertId;

        if (!expertId) return res.status(400).json({ message: 'expertId is required' });

        const eventType = new EventType({
            expert: expertId,
            title,
            duration,
            location,
            description,
            urlSlug
        });

        const createdEventType = await eventType.save();
        res.status(201).json(createdEventType);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Update an event type
// @route   PUT /api/event-types/:id
// @access  Private (Expert only)
const updateEventType = async (req, res) => {
    try {
        const { title, duration, location, description, urlSlug } = req.body;

        const eventType = await EventType.findById(req.params.id);

        if (eventType) {
            eventType.title = title || eventType.title;
            eventType.duration = duration || eventType.duration;
            eventType.location = location || eventType.location;
            eventType.description = description !== undefined ? description : eventType.description;
            eventType.urlSlug = urlSlug || eventType.urlSlug;

            const updatedEventType = await eventType.save();
            res.json(updatedEventType);
        } else {
            res.status(404).json({ message: 'Event type not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Delete an event type
// @route   DELETE /api/event-types/:id
// @access  Private (Expert only)
const deleteEventType = async (req, res) => {
    try {
        const eventType = await EventType.findById(req.params.id);

        if (eventType) {
            await eventType.deleteOne();
            res.json({ message: 'Event type removed' });
        } else {
            res.status(404).json({ message: 'Event type not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getEventTypesByExpert, createEventType, updateEventType, deleteEventType };
