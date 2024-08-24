const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
    const { username, password, role } = req.body;

    console.log('Received data:', req.body);

    if (!username || !password || !role) {
        console.log('Missing fields');
        return res.status(400).send('יש למלא את כל השדות הנדרשים.');
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('Username already exists');
            return res.status(400).send('שם המשתמש כבר קיים.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword, role });
        await user.save();

        console.log('User registered successfully');
        res.status(201).send('משתמש נרשם בהצלחה');
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('שגיאה ברישום המשתמש');
    }
});


module.exports = router;
