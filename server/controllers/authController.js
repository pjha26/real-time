const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ name, email, password });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUserPassword = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.password = req.body.password;
            await user.save();
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const becomeExpert = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.isExpert = true;
            await user.save();

            // create expert profile if not exists
            const Expert = require('../models/Expert'); // late require to avoid circular dependency issues if any
            const existingExpert = await Expert.findOne({ user: user._id });
            if (!existingExpert) {
                await Expert.create({
                    user: user._id,
                    name: user.name,
                    email: user.email,
                    category: 'Uncategorized', // default
                    bio: 'New expert on the platform',
                    experience: 0,
                    username: user.name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000),
                    availability: [
                        { dayOfWeek: 1, isAvailable: true, startTime: '09:00', endTime: '17:00' }, // Mon
                        { dayOfWeek: 2, isAvailable: true, startTime: '09:00', endTime: '17:00' }, // Tue
                        { dayOfWeek: 3, isAvailable: true, startTime: '09:00', endTime: '17:00' }, // Wed
                        { dayOfWeek: 4, isAvailable: true, startTime: '09:00', endTime: '17:00' }, // Thu
                        { dayOfWeek: 5, isAvailable: true, startTime: '09:00', endTime: '17:00' }, // Fri
                        { dayOfWeek: 6, isAvailable: false, startTime: '09:00', endTime: '17:00' }, // Sat
                        { dayOfWeek: 0, isAvailable: false, startTime: '09:00', endTime: '17:00' }  // Sun
                    ]
                });
            }

            res.json({ message: 'Successfully upgraded to Expert role', isExpert: true });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, getMe, updateUserProfile, updateUserPassword, becomeExpert };
