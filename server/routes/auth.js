const express = require('express');
const { User } = require('../models/user'); // استخدام `User` هنا
const jwt = require('jsonwebtoken');
const ResearchData = require('../models/ResearchData'); // Path to the new model
const bcrypt = require('bcryptjs');

// Initialize express Router
const router = express.Router();

// Registration route
router.post('/register', async (req, res) => {
    const { email, password, username, role } = req.body
    console.log('Received request body:', req.body); // Log for debugging

    try {
        if (!email || !password || !username || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists' });
        }


        const newUser = new User({
            email,
            password,
            username,
            role
        });

        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign(
            { _id: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        console.log('Generated token:', token); // ודא שהטוקן נוצר בהצלחה

        res.json({ token }); // שלח את הטוקן ל-Client
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Server error');
    }
});

const authenticateToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
        const user = await User.findById(decoded.userId); // Find user from DB

        if (!user) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.user = user; // Attach user to request
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ message: 'Failed to authenticate token' });
    }
};

// Route for fetching research data
router.get('/research-data', authenticateToken, async (req, res) => {
    // Check if the user role is 'student'
    if (req.user.role !== 'student') {
        return res.status(403).json({ message: 'Access denied. You do not have permission to view this data.' });
    }

    try {
        // Fetch research data from the database or another source
        const researchData = await ResearchData.find(); // Adjust according to your database schema
        res.json(researchData);
    } catch (err) {
        console.error('Error fetching research data:', err);
        res.status(500).json({ message: 'Error fetching research data' });
    }
});

// In your auth.js or user.js (or similar file)
router.get('/user/email/:email', async (req, res) => {
    const userEmail = decodeURIComponent(req.params.email);

    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ role: user.role });


    } catch (error) {
        console.error('Error fetching user by email:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;