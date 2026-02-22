const Expert = require('../models/Expert');

const getExperts = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, search } = req.query;
        const query = {};

        if (category) query.category = category;
        if (search) query.name = { $regex: search, $options: 'i' };

        const experts = await Expert.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Expert.countDocuments(query);

        res.json({
            experts,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getExpertById = async (req, res) => {
    try {
        const expert = await Expert.findById(req.params.id);
        if (!expert) return res.status(404).json({ message: 'Expert not found' });
        res.json(expert);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateExpertAvailability = async (req, res) => {
    try {
        const { availability, timezone } = req.body;

        const expert = await Expert.findOne({ user: req.user._id });
        if (!expert) return res.status(404).json({ message: 'Expert profile not found' });

        if (availability) expert.availability = availability;
        if (timezone) expert.timezone = timezone;

        await expert.save();
        res.json(expert);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getExperts, getExpertById, updateExpertAvailability };
