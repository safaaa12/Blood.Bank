const express = require('express');
const { User } = require('../models/user'); // استخدام `User` هنا
const jwt = require('jsonwebtoken');
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
      let { email, password } = req.body;
      email = email.trim().toLowerCase(); // Trim whitespace and convert to lowercase

      console.log('Login attempt with:', { email, password });

      const user = await User.findOne({ email });
      if (!user) {
          return res.status(400).json({ message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ message: 'Invalid email or password' });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWTPRIVATEKEY, { expiresIn: '1h' });
      res.status(200).json({ token });
  } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Server error' });
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

        console.log('Found user:', user); // בדוק את המשתמש שנמצא במסד הנתונים
        res.status(200).json({ role: user.role }); // שלח את התפקיד
    } catch (error) {
        console.error('Error fetching user by email:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;
