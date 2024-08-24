require('dotenv').config();  // טוען משתני סביבה מקובץ .env
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const registerRoutes = require('./routes/register'); // ייבוא מסלול הרישום
const loginRoutes = require('./routes/login'); // ייבוא מסלול ההתחברות

const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

// הגדרת מסלולים
app.use('/api/register', registerRoutes);
app.use('/api/login', loginRoutes);  // הוספת מסלול ההתחברות

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`The server is running on port ${PORT}`);
});
