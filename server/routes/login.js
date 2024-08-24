const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
router.post('/', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log('Attempting to find user:', username);
        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found');
            return res.status(400).send('שם משתמש או סיסמה שגויים');
        }

        console.log('User found, checking password...');
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);

        if (!isMatch) {
            console.log('Password does not match');
            return res.status(400).send('שם משתמש או סיסמה שגויים');
        }

        console.log('Password matches, generating token...');
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('שגיאה בהתחברות');
    }
});

module.exports = router;
