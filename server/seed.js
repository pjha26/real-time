const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Expert = require('./models/Expert');
const Booking = require('./models/Booking');

dotenv.config();

const expertsData = [
    {
        name: 'Dr. Alice Smith',
        category: 'Therapy',
        experience: 10,
        rating: 4.8,
        availableSlots: [
            { date: '2026-03-01', time: '10:00' },
            { date: '2026-03-01', time: '11:00' },
            { date: '2026-03-01', time: '14:00' }
        ]
    },
    {
        name: 'John Doe',
        category: 'Career Coaching',
        experience: 5,
        rating: 4.5,
        availableSlots: [
            { date: '2026-03-02', time: '09:00' },
            { date: '2026-03-03', time: '15:00' }
        ]
    },
    {
        name: 'Sarah Lee',
        category: 'Fitness Mentor',
        experience: 8,
        rating: 4.9,
        availableSlots: [
            { date: '2026-03-01', time: '08:00' },
            { date: '2026-03-01', time: '09:00' },
            { date: '2026-03-02', time: '08:00' }
        ]
    }
];

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        await Booking.deleteMany();
        await Expert.deleteMany();

        await Expert.insertMany(expertsData);
        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

connectDB();
